/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.13.0
 */
import React from "react";
import PropTypes from "prop-types";
import {withAppContext} from "../../../contexts/AppContext";
import {withActionFeedback} from "../../../contexts/ActionFeedbackContext";
import Icon from "../../Common/Icons/Icon";
import {withAdministrationWorkspace} from "../../../contexts/AdministrationWorkspaceContext";
import XRegExp from "xregexp";
import DisplayTestUserDirectoryAdministration
  from "../DisplayTestUserDirectoryAdministration/DisplayTestUserDirectoryAdministration";
import {withDialog} from "../../../contexts/DialogContext";
import {Trans, withTranslation} from "react-i18next";

/**
 * This component allows to display the MFA for the administration
 */
class DisplayUserDirectoryAdministration extends React.Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.state = this.defaultState;
    this.createRefs();
    this.bindCallbacks();
  }

  /**
   * Get default state
   * @returns {*}
   */
  get defaultState() {
    return {
      loading: true, // component is loading or not
      processing: false, // component is processing or not

      openCredentials: true, // section credential open
      openDirectoryConfiguration: false, // section directory configuration open
      openSynchronizationOptions: false, // section synchronization options open

      openConnectionType: false, // select connection type
      openDefaultAdmin: false, // select default user admin
      openDefaultGroupAdmin: false, // select default group user admin

      // FORM FIELDS
      userDirectoryToggle: false, // User directory toggle value
      // CREDENTIALS FIELDS
      directoryType: "ad",
      connectionType: "plain",
      host: "",
      hostError: null,
      port: "389",
      portError: null,
      username: "",
      password: "",
      domain: "",
      domainError: null,
      baseDn: "",
      // DIRECTORY CONFIGURATION FIELDS
      groupPath: "",
      userPath: "",
      groupObjectClass: "",
      userObjectClass: "",
      useEmailPrefix: false,
      emailPrefix: "",
      emailSuffix: "",
      // SYNCHRONIZATION OPTIONS
      defaultAdmin: "",
      defaultGroupAdmin: "",
      groupsParentGroup: "",
      usersParentGroup: "",
      enabledUsersOnly: false,
      createUsers: true,
      deleteUsers: true,
      createGroups: true,
      deleteGroups: true,
      updateGroups: true,
      // The search field to select a default user
      defaultAdminSearch: "",
      defaultGroupAdminSearch: "",

      users: null, // all users

      hasAlreadyBeenValidated: false, // True if the form has already been submitted once
    };
  }

  async componentDidMount() {
    document.addEventListener('click', this.handleUserDirectoryClickEvent);
    this.findAllUserDirectorySettings();
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleUserDirectoryClickEvent);
  }

  /**
   * Whenever the component has updated in terms of props or state
   * @param prevProps
   */
  async componentDidUpdate(prevProps, prevState) {
    await this.handleEnabledTestButton(prevState.userDirectoryToggle);
    await this.handleMustSubmit(prevProps.administrationWorkspaceContext);
  }

  /**
   * Bind callbacks methods
   */
  bindCallbacks() {
    this.handleUserDirectoryClickEvent = this.handleUserDirectoryClickEvent.bind(this);

    this.handleCredentialTitleClicked = this.handleCredentialTitleClicked.bind(this);
    this.handleDirectoryConfigurationTitleClicked = this.handleDirectoryConfigurationTitleClicked.bind(this);
    this.handleSynchronizationOptionsTitleClicked = this.handleSynchronizationOptionsTitleClicked.bind(this);
    this.handleConnectionTypeClicked = this.handleConnectionTypeClicked.bind(this);
    this.handleDefaultAdminClicked = this.handleDefaultAdminClicked.bind(this);
    this.handleDefaultGroupAdminClicked = this.handleDefaultGroupAdminClicked.bind(this);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleHostInputKeyUp = this.handleHostInputKeyUp.bind(this);
    this.handlePortInputKeyUp = this.handlePortInputKeyUp.bind(this);
    this.handleDomainInputKeyUp = this.handleDomainInputKeyUp.bind(this);
    this.stopPropagation = this.stopPropagation.bind(this);
    this.handleConnectionTypeChange = this.handleConnectionTypeChange.bind(this);
    this.handleUserToBeDefaultAdminClick = this.handleUserToBeDefaultAdminClick.bind(this);
    this.handleUserToBeDefaultGroupAdminClick = this.handleUserToBeDefaultGroupAdminClick.bind(this);
  }

  /**
   * Create DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createRefs() {
    this.connectionTypeRef = React.createRef();
    this.defaultAdminRef = React.createRef();
    this.defaultGroupAdminRef = React.createRef();
  }

  /**
   * Handle the userDirectoryToggle change
   * @param previousUserDirectoryToggle Previous userDirectoryToggle settings
   */
  handleEnabledTestButton(previousUserDirectoryToggle) {
    const hasPreviousUserDirectoryToggleChanged = this.state.userDirectoryToggle !== previousUserDirectoryToggle;
    if (hasPreviousUserDirectoryToggleChanged) {
      this.props.administrationWorkspaceContext.onTestEnabled(this.state.userDirectoryToggle);
    }
  }

  /**
   * Handle click events on UserDirectory component. Hide the component if the click occurred outside of the component.
   * @param {ReactEvent} event The event
   */
  handleUserDirectoryClickEvent(event) {
    // Prevent stop editing when the user click on an element of the editor
    if (this.defaultAdminRef.current !== null && !this.defaultAdminRef.current.contains(event.target)) {
      this.setState({openDefaultAdmin: false});
    }
    if (this.defaultGroupAdminRef.current !== null && !this.defaultGroupAdminRef.current.contains(event.target)) {
      this.setState({openDefaultGroupAdmin: false});
    }
    if (this.connectionTypeRef.current !== null && !this.connectionTypeRef.current.contains(event.target)) {
      this.setState({openConnectionType: false});
    }
  }

  /**
   * Stop propagation event
   * @param event
   */
  stopPropagation(event) {
    event.stopPropagation();
  }

  /**
   * Handle the must submit
   * @param previousAdministrationWorkspaceContext Previous administration workspace context settings
   */
  async handleMustSubmit(previousAdministrationWorkspaceContext) {
    const hasMustSaveChanged = this.props.administrationWorkspaceContext.must.save !== previousAdministrationWorkspaceContext.must.save;
    const hasMustTestChanged = this.props.administrationWorkspaceContext.must.test !== previousAdministrationWorkspaceContext.must.test;
    if ((hasMustSaveChanged && this.props.administrationWorkspaceContext.must.save)
      || (hasMustTestChanged && this.props.administrationWorkspaceContext.must.test)) {
      await this.handleFormSubmit();
      this.props.administrationWorkspaceContext.onResetActionsSettings();
    }
  }

  /**
   * fetch the user directory settings
   */
  async findAllUserDirectorySettings() {
    // USER DIRECTORY SETTINGS
    const result = await this.props.administrationWorkspaceContext.onGetUsersDirectoryRequested();
    const userDirectory = result.body;
    // USERS
    const usersResult = await this.props.administrationWorkspaceContext.onGetUsersRequested();
    const users = this.sortUsers(usersResult.body);
    let defaultAdmin = "";
    let defaultGroupAdmin = "";

    if (userDirectory.length !== 0) {
      const userDirectoryToggle = true;
      const directoryType = userDirectory.directory_type;
      const connectionType = userDirectory.connection_type;
      const domain = userDirectory.domain_name;
      const username = userDirectory.username;
      const password = userDirectory.password;
      const baseDn = userDirectory.base_dn;
      const host = userDirectory.server;
      const port = userDirectory.port.toString();
      defaultAdmin = userDirectory.default_user;
      defaultGroupAdmin = userDirectory.default_group_admin_user;
      const createUsers = userDirectory.sync_users_create;
      const deleteUsers = userDirectory.sync_users_delete;
      const createGroups = userDirectory.sync_groups_create;
      const deleteGroups = userDirectory.sync_groups_delete;
      const updateGroups = userDirectory.sync_groups_update;
      const enabledUsersOnly = userDirectory.enabled_users_only === true;
      const groupPath = userDirectory.group_path;
      const userPath = userDirectory.user_path;
      const groupObjectClass = userDirectory.group_object_class;
      const userObjectClass = userDirectory.user_object_class;
      const useEmailPrefix = userDirectory.use_email_prefix_suffix;
      const emailPrefix = userDirectory.email_prefix;
      const emailSuffix = userDirectory.email_suffix;
      const groupsParentGroup = userDirectory.groups_parent_group;
      const usersParentGroup = userDirectory.users_parent_group;

      this.setState({
        loading: false,
        users,
        userDirectoryToggle,
        directoryType,
        connectionType,
        domain,
        username,
        password,
        baseDn,
        host,
        port,
        defaultAdmin,
        defaultGroupAdmin,
        enabledUsersOnly,
        groupPath,
        userPath,
        groupObjectClass,
        userObjectClass,
        useEmailPrefix,
        emailPrefix,
        emailSuffix,
        groupsParentGroup,
        usersParentGroup,
        createUsers,
        deleteUsers,
        createGroups,
        deleteGroups,
        updateGroups
      });
      this.props.administrationWorkspaceContext.onTestEnabled(userDirectoryToggle);
      this.props.administrationWorkspaceContext.onSynchronizeEnabled(userDirectoryToggle);
    } else {
      const userLogged = users.find(user => this.props.context.loggedInUser.id === user.id);
      defaultAdmin = userLogged.id;
      defaultGroupAdmin = userLogged.id;
      this.setState({
        loading: false,
        users,
        defaultAdmin,
        defaultGroupAdmin
      });
    }
  }

  sortUsers(users) {
    const getUserFullName = user => `${user.profile.first_name} ${user.profile.last_name}`;
    const nameSorter = (u1, u2) => getUserFullName(u1).localeCompare(getUserFullName(u2));
    return users.sort(nameSorter);
  }

  /**
   * Handle the click on the credential title
   */
  handleCredentialTitleClicked() {
    this.setState({openCredentials: !this.state.openCredentials});
  }

  /**
   * Handle the click on the credential title
   */
  handleDirectoryConfigurationTitleClicked() {
    this.setState({openDirectoryConfiguration: !this.state.openDirectoryConfiguration});
  }

  /**
   * Handle the click on the credential title
   */
  handleSynchronizationOptionsTitleClicked() {
    this.setState({openSynchronizationOptions: !this.state.openSynchronizationOptions});
  }

  /**
   * Handle the click on the connection type
   */
  handleConnectionTypeClicked() {
    if (!this.hasAllInputDisabled()) {
      this.setState({openConnectionType: !this.state.openConnectionType});
    }
  }

  /**
   * Handle the click on the default admin
   */
  handleDefaultAdminClicked() {
    if (!this.hasAllInputDisabled()) {
      this.setState({openDefaultAdmin: !this.state.openDefaultAdmin, defaultAdminSearch: ""});
    }
  }

  /**
   * Handle the click on the default group admin
   */
  handleDefaultGroupAdminClicked() {
    if (!this.hasAllInputDisabled()) {
      this.setState({openDefaultGroupAdmin: !this.state.openDefaultGroupAdmin, defaultGroupAdminSearch: ""});
    }
  }

  /**
   * Handle host input keyUp event.
   */
  handleHostInputKeyUp() {
    if (this.state.hasAlreadyBeenValidated) {
      const state = this.validateHostInput();
      this.setState(state);
    }
  }

  /**
   * Handle port input keyUp event.
   */
  handlePortInputKeyUp() {
    if (this.state.hasAlreadyBeenValidated) {
      const state = this.validatePortInput();
      this.setState(state);
    }
  }

  /**
   * Handle host input keyUp event.
   */
  handleDomainInputKeyUp() {
    if (this.state.hasAlreadyBeenValidated) {
      const state = this.validateDomainInput();
      this.setState(state);
    }
  }

  /**
   * Handle form input changes.
   * @params {ReactEvent} The react event
   * @returns {void}
   */
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({[name]: value});
    this.handleEnabledSaveButton();
  }

  /**
   * Handle user to be default admin click event
   * @param event
   */
  handleUserToBeDefaultAdminClick(event) {
    const target = event.target;
    const userId = target.dataset.id;
    this.setState({defaultAdmin: userId});
    this.handleEnabledSaveButton();
  }

  /**
   * Handle user to be default Group admin click event
   * @param event
   */
  handleUserToBeDefaultGroupAdminClick(event) {
    const target = event.target;
    const userId = target.dataset.id;
    this.setState({defaultGroupAdmin: userId});
    this.handleEnabledSaveButton();
  }

  /**
   * Handle connection typeclick event
   * @param event
   */
  handleConnectionTypeChange(event) {
    const target = event.target;
    const connectionType = target.dataset.id;
    this.setState({connectionType});
    this.handleEnabledSaveButton();
  }

  /**
   * Handle enabled the save button
   */
  handleEnabledSaveButton() {
    if (!this.props.administrationWorkspaceContext.can.save) {
      this.props.administrationWorkspaceContext.onSaveEnabled();
    }
  }

  /**
   * Should input be disabled? True if state is loading or processing
   * @returns {boolean}
   */
  hasAllInputDisabled() {
    return this.state.processing || this.state.loading;
  }

  /**
   * If user directory is checked
   * @returns {boolean}
   */
  isUserDirectoryChecked() {
    return this.state.userDirectoryToggle;
  }

  /**
   * If active directory is checked
   */
  isActiveDirectoryChecked() {
    return this.state.directoryType === "ad";
  }

  /**
   * If open ldap is checked
   */
  isOpenLdapChecked() {
    return this.state.directoryType === "openldap";
  }

  /**
   * If use email prefix is checked
   */
  isUseEmailPrefixChecked() {
    return this.state.useEmailPrefix;
  }

  /**
   * Validate the form.
   * @returns {Promise<boolean>}
   */
  async validate() {
    // Validate the form inputs.
    await Promise.all([
      this.validateHostInput(),
      this.validatePortInput(),
      this.validateDomainInput(),
    ]);
  }

  /**
   * Validate the host input.
   * @returns {Promise<void>}
   */
  async validateHostInput() {
    let hostError = null;
    const host = this.state.host.trim();
    if (!host.length) {
      hostError = this.translate("A host is required.");
    }
    return this.setState({hostError});
  }

  /**
   * Validate the port input.
   * @returns {Promise<void>}
   */
  async validatePortInput() {
    let portError = null;
    const port = this.state.port.trim();
    if (!port.length) {
      portError = this.translate("A port is required.");
    } else if (!XRegExp("^[0-9]+").test(port)) {
      portError = this.translate("Only numeric characters allowed.");
    }
    return this.setState({portError});
  }

  /**
   * Validate the domain input.
   * @returns {Promise<void>}
   */
  async validateDomainInput() {
    let domainError = null;
    const domain = this.state.domain.trim();
    if (!domain.length) {
      domainError = this.translate("A domain name is required.");
    }
    return this.setState({domainError});
  }

  /**
   * Return true if the form has some validation error
   * @returns {boolean}
   */
  hasValidationError() {
    return this.state.hostError !== null || this.state.portError !== null || this.state.domainError !== null;
  }

  /**
   * Handle form submit event.
   * @params {ReactEvent} The react event
   * @returns {void}
   */
  async handleFormSubmit() {
    await this.setState({hasAlreadyBeenValidated: true});
    // Do not re-submit an already processing form
    if (!this.state.processing) {
      await this.toggleProcessing();
      await this.validate();
      if (this.hasValidationError()) {
        await this.toggleProcessing();
        return;
      }
      try {
        if (this.props.administrationWorkspaceContext.must.save) {
          await this.saveUserDirectory();
          await this.handleSaveSuccess();
        } else if (this.props.administrationWorkspaceContext.must.test) {
          await this.testUserDirectory();
        }
        this.setState({processing: false});
      } catch (error) {
        await this.handleSaveError(error);
      }
    }
  }

  createUserDirectoryDTO() {
    const directory_type = this.state.directoryType;
    const domain_name = this.state.domain;
    const connection_type = this.state.connectionType;
    const server = this.state.host;
    const port = parseInt(this.state.port);
    const username = this.state.username;
    const password = this.state.password;
    const base_dn = this.state.baseDn;
    const group_path = this.state.groupPath;
    const user_path = this.state.userPath;
    const default_user = this.state.defaultAdmin;
    const default_group_admin_user = this.state.defaultGroupAdmin;
    const groups_parent_group = this.state.groupsParentGroup;
    const users_parent_group = this.state.usersParentGroup;
    const enabled_users_only = this.state.enabledUsersOnly;
    const sync_users_create = this.state.createUsers;
    const sync_users_delete = this.state.deleteUsers;
    const sync_groups_create = this.state.createGroups;
    const sync_groups_delete = this.state.deleteGroups;
    const sync_groups_update = this.state.updateGroups;
    const enabled = this.state.userDirectoryToggle;

    let group_object_class = "";
    let user_object_class = "";
    let use_email_prefix_suffix = false;
    let email_prefix = "";
    let email_suffix = "";
    if (directory_type == "openldap") {
      group_object_class = this.state.groupObjectClass;
      user_object_class = this.state.userObjectClass;
      use_email_prefix_suffix = this.state.useEmailPrefix;

      if (use_email_prefix_suffix) {
        email_prefix = this.state.emailPrefix;
        email_suffix = this.state.emailSuffix;
      }
    }

    return {
      directory_type,
      domain_name,
      connection_type,
      server,
      port,
      username,
      password,
      base_dn,
      group_path,
      user_path,
      group_object_class,
      user_object_class,
      default_user,
      default_group_admin_user,
      groups_parent_group,
      users_parent_group,
      enabled_users_only,
      sync_users_create,
      sync_users_delete,
      sync_groups_create,
      sync_groups_delete,
      sync_groups_update,
      enabled,
      use_email_prefix_suffix,
      email_prefix,
      email_suffix
    };
  }

  /**
   * save user directory settings
   * @returns {Promise<*>}
   */
  async saveUserDirectory() {
    if (this.state.userDirectoryToggle) {
      await this.props.administrationWorkspaceContext.onUpdateUsersDirectoryRequested(this.createUserDirectoryDTO());
      this.props.administrationWorkspaceContext.onSynchronizeEnabled(true);
    } else {
      this.setState(this.defaultState);
      await this.props.administrationWorkspaceContext.onDeleteUsersDirectoryRequested();
      this.props.administrationWorkspaceContext.onSynchronizeEnabled(false);
      this.setState({loading: false});
    }
  }

  /**
   * test user directory settings
   */
  async testUserDirectory() {
    const result = await this.props.administrationWorkspaceContext.onTestUsersDirectoryRequested(this.createUserDirectoryDTO());
    const displayTestUserDirectoryDialogProps = {
      userDirectoryTestResult: result.body
    };
    this.props.context.setContext({displayTestUserDirectoryDialogProps});
    this.props.dialogContext.open(DisplayTestUserDirectoryAdministration);
  }

  /**
   * Handle save operation success.
   */
  async handleSaveSuccess() {
    await this.props.actionFeedbackContext.displaySuccess(this.translate("The user directory settings for the organization were updated."));
  }

  /**
   * Handle save operation error.
   * @param {object} error The returned error
   */
  async handleSaveError(error) {
    // It can happen when the user has closed the passphrase entry dialog by instance.
    if (error.name === "UserAbortsOperationError") {
      this.setState({processing: false});
    } else {
      // Unexpected error occurred.
      console.error(error);
      await this.handleError(error);
      this.setState({processing: false});
    }
  }

  /**
   * handle error to display the error dialog
   * @param error
   */
  async handleError(error) {
    await this.props.actionFeedbackContext.displayError(error.message);
  }

  /**
   * Toggle processing state
   * @returns {Promise<void>}
   */
  async toggleProcessing() {
    const prev = this.state.processing;
    return this.setState({processing: !prev});
  }

  /**
   * Get users allowed to be default admin
   */
  getUsersAllowedToBeDefaultAdmin() {
    if (this.state.users !== null) {
      const users = this.state.users.filter(user => user.active === true && user.role.name === "admin");
      if (this.state.defaultAdminSearch !== "") {
        return this.getUsersMatch(users, this.state.defaultAdminSearch.toLowerCase());
      }
      return users;
    }
    return [];
  }

  /**
   * Get users allowed to be default group admin
   */
  getUsersAllowedToBeDefaultGroupAdmin() {
    if (this.state.users !== null) {
      const users = this.state.users.filter(user => user.active === true);
      if (this.state.defaultGroupAdminSearch !== "") {
        return this.getUsersMatch(users, this.state.defaultGroupAdminSearch.toLowerCase());
      }
      return users;
    }
    return [];
  }

  /**
   *  get users who match the keyword
   * @param users
   * @param keyword
   * @returns {*}
   */
  getUsersMatch(users, keyword) {
    const words = (keyword && keyword.split(/\s+/)) || [''];

    // Test match of some escaped test words against the name / username
    const escapeWord = word => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordToRegex = word => new RegExp(escapeWord(word), 'i');
    const matchWord = (word, value) => wordToRegex(word).test(value);

    const matchUsernameProperty = (word, user) => matchWord(word, user.username);
    const matchNameProperty = (word, user) => matchWord(word, user.profile.first_name) || matchWord(word, user.profile.last_name);
    const matchUser = (word, user) => matchUsernameProperty(word, user) || matchNameProperty(word, user);
    const matchText = user => words.every(word => matchUser(word, user));

    return users.filter(matchText);
  }

  /**
   * display user firstname, lastname and username
   * @param user
   * @returns {string}
   */
  displayUser(user) {
    return `${user.profile.first_name} ${user.profile.last_name} (${user.username})`;
  }

  /**
   * Display default admin
   */
  displayDefaultAdmin() {
    if (this.state.users !== null && this.state.defaultAdmin !== "") {
      const user = this.state.users.find(user => user.id === this.state.defaultAdmin);
      return this.displayUser(user);
    }
    return "";
  }

  /**
   * get the connection type
   */
  get connectionType() {
    return {
      plain: "ldap://",
      ssl: "ldaps:// (ssl)",
      tls: "ldaps:// (tls)"
    };
  }

  /**
   * Display default group admin
   */
  displayDefaultGroupAdmin() {
    if (this.state.users !== null && this.state.defaultGroupAdmin !== "") {
      const user = this.state.users.find(user => user.id === this.state.defaultGroupAdmin);
      return this.displayUser(user);
    }
    return "";
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
  }

  /**
   * Render the component
   * @returns {JSX}
   */
  render() {
    const userAllowedToBeDefaultAdmin = this.getUsersAllowedToBeDefaultAdmin();
    const userAllowedToBeDefaultGroupAdmin = this.getUsersAllowedToBeDefaultGroupAdmin();

    return (
      <div className="row">
        <div className="ldap-settings col8">
          <form className="form">
            <h3>
              <span className="input toggle-switch form-element">
                <input type="checkbox" className="toggle-switch-checkbox checkbox" name="userDirectoryToggle"
                  onChange={this.handleInputChange} checked={this.state.userDirectoryToggle} disabled={this.hasAllInputDisabled()}
                  id="userDirectoryToggle"/>
                <label className="toggle-switch-button" htmlFor="userDirectoryToggle"></label>
              </span><label><Trans>Users Directory</Trans></label>
            </h3>
            {!this.isUserDirectoryChecked() &&
            <p className="description">
              <Trans>No Users Directory is configured. Enable it to synchronise your users and groups with passbolt.</Trans>
            </p>
            }
            {this.isUserDirectoryChecked() &&
            <div>
              <p className="description">
                <Trans>A Users Directory is configured. The users and groups of passbolt will synchronize with it.</Trans>
              </p>
              <div className="form-content">
                <div className={`accordion section-general ${this.state.openCredentials ? "" : "closed"}`}>
                  <h3 className="accordion-header">
                    <a onClick={this.handleCredentialTitleClicked}>
                      {this.state.openCredentials && <Icon name="caret-down" baseline={true}/>}
                      {!this.state.openCredentials && <Icon name="caret-right" baseline={true}/>}
                      <Trans>Credentials</Trans>
                    </a>
                  </h3>
                  <div className="accordion-content">
                    <div className="radiolist required">
                      <label><Trans>Directory type</Trans></label>
                      <div className="input radio ad openldap form-element ">
                        <div className="input radio">
                          <input type="radio" value="ad" onChange={this.handleInputChange} name="directoryType"
                            checked={this.state.directoryType === "ad"} id="directoryTypeAd"
                            disabled={this.hasAllInputDisabled()}/>
                          <label htmlFor="directoryTypeAd"><Trans>Active Directory</Trans></label>
                        </div>
                        <div className="input radio">
                          <input type="radio" value="openldap" onChange={this.handleInputChange} name="directoryType"
                            checked={this.state.directoryType === "openldap"} id="directoryTypeOpenLdap"
                            disabled={this.hasAllInputDisabled()}/>
                          <label htmlFor="directoryTypeOpenLdap"><Trans>Open Ldap</Trans></label>
                        </div>
                      </div>
                    </div>
                    <div className="singleline connection_info protocol_host_port clearfix required ad openldap">
                      <label><Trans>Server url</Trans></label>
                      <div className="input text field_protocol_host ad openldap">
                        <div onClick={this.handleConnectionTypeClicked} ref={this.connectionTypeRef}
                          className={`chosen-container chosen-container-single connection-type ${this.hasAllInputDisabled() ? "chosen-disabled" : "chosen-container-active"} ${this.state.openConnectionType ? "chosen-with-drop" : ""}`}>
                          <a className="chosen-single">
                            <span id="connection-type-input">{this.connectionType[this.state.connectionType]}</span>
                            <div>
                              {!this.state.openDefaultGroupAdmin &&
                              <Icon name="caret-down" baseline={true}/>
                              }
                              {this.state.openDefaultGroupAdmin &&
                              <Icon name="caret-up" baseline={true}/>
                              }
                            </div>
                          </a>
                          <div className="chosen-drop">
                            <ul className="chosen-results">
                              <li className="active-result" onClick={this.handleConnectionTypeChange} data-id={"plain"}>ldap://</li>
                              <li className="active-result" onClick={this.handleConnectionTypeChange} data-id={"ssl"}>ldaps:// (ssl)</li>
                              <li className="active-result" onClick={this.handleConnectionTypeChange} data-id={"tls"}>ldaps:// (tls)</li>
                            </ul>
                          </div>
                        </div>
                        <div className="input text host ad openldap">
                          <input id="server-input" type="text" className="required fluid form-element" name="host"
                            value={this.state.host} onChange={this.handleInputChange} onKeyUp={this.handleHostInputKeyUp}
                            placeholder={this.translate("host")} disabled={this.hasAllInputDisabled()}/>
                          {this.state.hostError &&
                          <div id="server-input-feedback" className="message error">{this.state.hostError}</div>
                          }
                        </div>
                      </div>
                      <div className="input text port ad openldap">
                        <input id="port-input" type="number" className="required fluid form-element" name="port"
                          value={this.state.port} onChange={this.handleInputChange} onKeyUp={this.handlePortInputKeyUp} placeholder={this.translate("port")}
                          disabled={this.hasAllInputDisabled()}/>
                        {this.state.portError &&
                        <div id="port-input-feedback" className="message error">{this.state.portError}</div>
                        }
                      </div>
                    </div>
                    <div className="singleline clearfix">
                      <div className="input text first-field ad openldap">
                        <label><Trans>Username</Trans></label>
                        <input id="username-input" type="text" className="fluid form-element" name="username"
                          value={this.state.username} onChange={this.handleInputChange} placeholder={this.translate("username")}
                          disabled={this.hasAllInputDisabled()}/>
                      </div>
                      <div className="input text last-field ad openldap">
                        <label><Trans>Password</Trans></label>
                        <input id="password-input" className="fluid form-element" name="password"
                          value={this.state.password} onChange={this.handleInputChange} placeholder={this.translate("password")} type="password"
                          disabled={this.hasAllInputDisabled()}/>
                      </div>
                    </div>
                    <div className="input text required ad openldap">
                      <label><Trans>Domain</Trans></label>
                      <input id="domain-name-input" type="text" name="domain" value={this.state.domain}
                        onChange={this.handleInputChange} className="required fluid form-element" onKeyUp={this.handleDomainInputKeyUp}
                        placeholder="domain.ext" disabled={this.hasAllInputDisabled()}/>
                      {this.state.domainError &&
                      <div id="domain-name-input-feedback" className="message error">{this.state.domainError}</div>
                      }
                    </div>
                    <div className="input text ad openldap">
                      <label><Trans>Base DN</Trans></label>
                      <input id="base-dn-input" type="text" name="baseDn" value={this.state.baseDn}
                        onChange={this.handleInputChange} className="fluid form-element" placeholder="OU=OrgUsers,DC=mydomain,DC=local"
                        disabled={this.hasAllInputDisabled()}/>
                      <div className="message">
                        <Trans>The base DN (default naming context) for the domain.</Trans> <Trans>If this is empty then it will be queried from the RootDSE.</Trans>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`accordion section-directory-configuration ${this.state.openDirectoryConfiguration ? "" : "closed"}`}>
                  <h3 className="accordion-header">
                    <a onClick={this.handleDirectoryConfigurationTitleClicked}>
                      {this.state.openDirectoryConfiguration && <Icon name="caret-down" baseline={true}/>}
                      {!this.state.openDirectoryConfiguration && <Icon name="caret-right" baseline={true}/>}
                      <Trans>Directory configuration</Trans>
                    </a>
                  </h3>
                  <div className="accordion-content">
                    <div className="input text ad openldap">
                      <label><Trans>Group path</Trans></label>
                      <input id="group-path-input" type="text" name="groupPath" value={this.state.groupPath}
                        onChange={this.handleInputChange} className="required fluid form-element" placeholder={this.translate("Group Path")}
                        disabled={this.hasAllInputDisabled()}/>
                      <div className="message">
                        <Trans>Group path is used in addition to the base DN while searching groups.</Trans> <Trans>Leave empty if users and groups are in the same DN.</Trans>
                      </div>
                    </div>
                    <div className="input text ad openldap">
                      <label><Trans>User path</Trans></label>
                      <input id="user-path-input" type="text" name="userPath" value={this.state.userPath}
                        onChange={this.handleInputChange} className="required fluid form-element" placeholder={this.translate("User Path")}
                        disabled={this.hasAllInputDisabled()}/>
                      <div className="message"><Trans>User path is used in addition to base DN while searching users.</Trans></div>
                    </div>
                    {this.isOpenLdapChecked() &&
                    <div>
                      <div className="input text openldap">
                        <label><Trans>Group object class</Trans></label>
                        <input id="group-object-class-input" type="text" name="groupObjectClass"
                          value={this.state.groupObjectClass} onChange={this.handleInputChange} className="required fluid"
                          placeholder="GroupObjectClass" disabled={this.hasAllInputDisabled()}/>
                        <div className="message">
                          <Trans>For Openldap only. Defines which group object to use.</Trans> (<Trans>Default</Trans>: posixGroup)
                        </div>
                      </div>
                      <div className="input text openldap">
                        <label><Trans>User object class</Trans></label>
                        <input id="user-object-class-input" type="text" name="userObjectClass"
                          value={this.state.userObjectClass} onChange={this.handleInputChange} className="required fluid form-element"
                          placeholder="UserObjectClass" disabled={this.hasAllInputDisabled()}/>
                        <div className="message"><Trans>For Openldap only. Defines which user object to use.</Trans> (<Trans>Default</Trans>: inetOrgPerson)
                        </div>
                      </div>
                      <div className="input text openldap">
                        <label><Trans>Use email prefix / suffix?</Trans></label>
                        <div className="input toggle-switch openldap form-element">
                          <label htmlFor="use-email-prefix-suffix-toggle-button">
                            <Trans>Build email based on a prefix and suffix?</Trans>
                          </label>
                          <input type="checkbox" className="toggle-switch-checkbox checkbox" name="useEmailPrefix"
                            value={this.state.useEmailPrefix} onChange={this.handleInputChange} id="use-email-prefix-suffix-toggle-button"
                            disabled={this.hasAllInputDisabled()}/>
                          <label className="toggle-switch-button" htmlFor="use-email-prefix-suffix-toggle-button"></label>
                        </div>
                        <div className="message">
                          <Trans>Use this option when user entries do not include an email address by default</Trans>
                        </div>
                      </div>
                      {this.isUseEmailPrefixChecked() &&
                      <div className="singleline clearfix" id="use-email-prefix-suffix-options">
                        <div className="input text first-field openldap">
                          <label><Trans>Email prefix</Trans></label>
                          <input id="email-prefix-input" type="text" name="emailPrefix" checked={this.state.emailPrefix}
                            onChange={this.handleInputChange} className="required fluid form-element" placeholder={this.translate("username")}
                            disabled={this.hasAllInputDisabled()}/>
                          <div className="message">
                            <Trans>The attribute you would like to use for the first part of the email (usually username).</Trans>
                          </div>
                        </div>
                        <div className="input text last-field openldap">
                          <label><Trans>Email suffix</Trans></label>
                          <input id="email-suffix-input" type="text" name="emailSuffix" value={this.state.emailSuffix}
                            onChange={this.handleInputChange} className="required form-element"
                            placeholder={this.translate("@your-domain.com")} disabled={this.hasAllInputDisabled()}/>
                          <div className="message">
                            <Trans>The domain name part of the email (@your-domain-name).</Trans>
                          </div>
                        </div>
                      </div>
                      }
                    </div>
                    }
                  </div>
                </div>
                <div
                  className={`accordion section-sync-options ${this.state.openSynchronizationOptions ? "" : "closed"}`}>
                  <h3 className="accordion-header">
                    <a onClick={this.handleSynchronizationOptionsTitleClicked}>
                      {this.state.openSynchronizationOptions && <Icon name="caret-down" baseline={true}/>}
                      {!this.state.openSynchronizationOptions && <Icon name="caret-right" baseline={true}/>}
                      <Trans>Synchronization options</Trans>
                    </a>
                  </h3>
                  <div className="accordion-content">
                    <div className="input select required ad openldap">
                      <label><Trans>Default admin</Trans></label>
                      <div onClick={this.handleDefaultAdminClicked} ref={this.defaultAdminRef}>
                        <div
                          className={`chosen-container chosen-container-single ${this.hasAllInputDisabled() ? "chosen-disabled" : "chosen-container-active"} ${this.state.openDefaultAdmin ? "chosen-with-drop" : ""}`}>
                          <a className="chosen-single">
                            <span id="default-user-select">{this.displayDefaultAdmin()}</span>
                            <div>
                              {!this.state.openDefaultAdmin &&
                              <Icon name="caret-down" baseline={true}/>
                              }
                              {this.state.openDefaultAdmin &&
                              <Icon name="caret-up" baseline={true}/>
                              }
                            </div>
                          </a>
                          <div className="chosen-drop">
                            <div className="chosen-search" onClick={this.stopPropagation}>
                              <input className="chosen-search-input" name="defaultAdminSearch"
                                value={this.state.defaultAdminSearch} onChange={this.handleInputChange} type="text"/>
                              <Icon name="search"/>
                            </div>
                            <ul className="chosen-results">
                              {userAllowedToBeDefaultAdmin.length > 0 &&
                              userAllowedToBeDefaultAdmin.map(user =>
                                <li key={user.id} className="active-result" onClick={this.handleUserToBeDefaultAdminClick} data-id={user.id}>
                                  {this.displayUser(user)}
                                </li>
                              )
                              }
                              {userAllowedToBeDefaultAdmin.length === 0 &&
                              <li className="no-results" onClick={this.stopPropagation}>
                                <Trans>No results match</Trans> <span>{this.state.defaultAdminSearch}</span>
                              </li>
                              }
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="message">
                        <Trans>The default admin user is the user that will perform the operations for the the directory.</Trans>
                      </div>
                    </div>
                    <div className="input select required ad openldap">
                      <label><Trans>Default group admin</Trans></label>
                      <div onClick={this.handleDefaultGroupAdminClicked} ref={this.defaultGroupAdminRef}>
                        <div
                          className={`chosen-container chosen-container-single ${this.hasAllInputDisabled() ? "chosen-disabled" : "chosen-container-active"} ${this.state.openDefaultGroupAdmin ? "chosen-with-drop" : ""}`}>
                          <a className="chosen-single">
                            <span id="default-group-admin-user-select">{this.displayDefaultGroupAdmin()}</span>
                            <div>
                              {!this.state.openDefaultGroupAdmin &&
                              <Icon name="caret-down" baseline={true}/>
                              }
                              {this.state.openDefaultGroupAdmin &&
                              <Icon name="caret-up" baseline={true}/>
                              }
                            </div>
                          </a>
                          <div className="chosen-drop">
                            <div className="chosen-search" onClick={this.stopPropagation}>
                              <input className="chosen-search-input" name="defaultGroupAdminSearch"
                                value={this.state.defaultGroupAdminSearch} onChange={this.handleInputChange} type="text"/>
                              <Icon name="search"/>
                            </div>
                            <ul className="chosen-results">
                              {userAllowedToBeDefaultGroupAdmin.length > 0 &&
                              userAllowedToBeDefaultGroupAdmin.map(user =>
                                <li key={user.id} className="active-result" onClick={this.handleUserToBeDefaultGroupAdminClick} data-id={user.id}>
                                  {this.displayUser(user)}
                                </li>
                              )
                              }
                              {userAllowedToBeDefaultGroupAdmin.length === 0 &&
                              <li className="no-results" onClick={this.stopPropagation}>
                                <Trans>No results match</Trans> <span>{this.state.defaultGroupAdminSearch}</span>
                              </li>
                              }
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="message">
                        <Trans>The default group manager is the user that will be the group manager of newly created groups.</Trans>
                      </div>
                    </div>
                    <div className="input text ad openldap">
                      <label><Trans>Groups parent group</Trans></label>
                      <input id="groups-parent-group-input" type="text" name="groupsParentGroup"
                        value={this.state.groupsParentGroup} onChange={this.handleInputChange} className="fluid form-element" placeholder={this.translate("Group name")}
                        disabled={this.hasAllInputDisabled()}/>
                      <div className="message">
                        <Trans>Synchronize only the groups which are members of this group.</Trans>
                      </div>
                    </div>
                    <div className="input text ad openldap">
                      <label><Trans>Users parent group</Trans></label>
                      <input id="users-parent-group-input" type="text" name="usersParentGroup"
                        value={this.state.usersParentGroup} onChange={this.handleInputChange} className="fluid form-element" placeholder={this.translate("Group name")}
                        disabled={this.hasAllInputDisabled()}/>
                      <div className="message">
                        <Trans>Synchronize only the users which are members of this group.</Trans>
                      </div>
                    </div>
                    {this.isActiveDirectoryChecked() &&
                    <div className="input text clearfix ad">
                      <label><Trans>Enabled users only</Trans></label>
                      <div className="input toggle-switch ad form-element">
                        <label htmlFor="enabled-users-only-toggle-button"><Trans>Only synchronize enabled users (AD)</Trans></label>
                        <input type="checkbox" className="toggle-switch-checkbox checkbox" name="enabledUsersOnly"
                          checked={this.state.enabledUsersOnly} onChange={this.handleInputChange} id="enabled-users-only-toggle-button"
                          disabled={this.hasAllInputDisabled()}/>
                        <label className="toggle-switch-button" htmlFor="enabled-users-only-toggle-button"></label>
                      </div>
                    </div>
                    }
                    <div className="input text clearfix ad openldap">
                      <label><Trans>Sync operations</Trans></label>
                      <div className="col6">
                        <div className="input toggle-switch ad openldap form-element">
                          <label htmlFor="sync-users-create-toggle-button"><Trans>Create users</Trans></label>
                          <input type="checkbox" className="toggle-switch-checkbox checkbox" name="createUsers"
                            checked={this.state.createUsers} onChange={this.handleInputChange} id="sync-users-create-toggle-button"
                            disabled={this.hasAllInputDisabled()}/>
                          <label className="toggle-switch-button" htmlFor="sync-users-create-toggle-button"></label>
                        </div>
                        <div className="input toggle-switch ad openldap form-element">
                          <label htmlFor="sync-users-delete-toggle-button"><Trans>Delete users</Trans></label>
                          <input type="checkbox" className="toggle-switch-checkbox checkbox" name="deleteUsers"
                            checked={this.state.deleteUsers} onChange={this.handleInputChange} id="sync-users-delete-toggle-button"
                            disabled={this.hasAllInputDisabled()}/>
                          <label className="toggle-switch-button" htmlFor="sync-users-delete-toggle-button"></label>
                        </div>
                      </div>
                      <div className="col6 last">
                        <div className="input toggle-switch ad openldap form-element">
                          <label htmlFor="sync-groups-create-toggle-button"><Trans>Create groups</Trans></label>
                          <input type="checkbox" className="toggle-switch-checkbox checkbox" name="createGroups"
                            checked={this.state.createGroups} onChange={this.handleInputChange} id="sync-groups-create-toggle-button"
                            disabled={this.hasAllInputDisabled()}/>
                          <label className="toggle-switch-button" htmlFor="sync-groups-create-toggle-button"></label>
                        </div>
                        <div className="input toggle-switch ad openldap form-element">
                          <label htmlFor="sync-groups-delete-toggle-button"><Trans>Delete groups</Trans></label>
                          <input type="checkbox" className="toggle-switch-checkbox checkbox" name="deleteGroups"
                            checked={this.state.deleteGroups} onChange={this.handleInputChange} id="sync-groups-delete-toggle-button"
                            disabled={this.hasAllInputDisabled()}/>
                          <label className="toggle-switch-button" htmlFor="sync-groups-delete-toggle-button"></label>
                        </div>
                        <div className="input toggle-switch ad openldap form-element">
                          <label htmlFor="sync-groups-update-toggle-button"><Trans>Update groups</Trans></label>
                          <input type="checkbox" className="toggle-switch-checkbox checkbox" name="updateGroups"
                            checked={this.state.updateGroups} onChange={this.handleInputChange} id="sync-groups-update-toggle-button"
                            disabled={this.hasAllInputDisabled()}/>
                          <label className="toggle-switch-button" htmlFor="sync-groups-update-toggle-button"></label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            }
          </form>
        </div>
        <div className="col4 last">
          <h2><Trans>Need help?</Trans></h2>
          <p><Trans>Check out our ldap configuration guide.</Trans></p>
          <a className="button" href="https://help.passbolt.com/configure/ldap" target="_blank" rel="noopener noreferrer">
            <Icon name="life-ring"/>
            <span><Trans>Read documentation</Trans></span>
          </a>
        </div>
      </div>
    );
  }
}

DisplayUserDirectoryAdministration.propTypes = {
  context: PropTypes.object, // Application context
  administrationWorkspaceContext: PropTypes.object, // The administration workspace context
  actionFeedbackContext: PropTypes.any, // The action feedback context
  dialogContext: PropTypes.any, // The dialog context
  t: PropTypes.func, // The translation function
};

export default withAppContext(withActionFeedback(withDialog(withAdministrationWorkspace(withTranslation('common')(DisplayUserDirectoryAdministration)))));
