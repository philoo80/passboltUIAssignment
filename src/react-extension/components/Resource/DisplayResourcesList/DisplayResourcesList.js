/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright s    Copyright (c) Passbolt SARL (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.11.0
 */
import PropTypes from "prop-types";
import React from "react";
import ReactList from "react-list";
import {withAppContext} from "../../../contexts/AppContext";
import {
  resourceLinkAuthorizedProtocols,
  ResourceWorkspaceFilterTypes,
  withResourceWorkspace
} from "../../../contexts/ResourceWorkspaceContext";
import debounce from "debounce-promise";
import Icon from "../../Common/Icons/Icon";
import {withActionFeedback} from "../../../contexts/ActionFeedbackContext";
import {withRouter} from "react-router-dom";
import DisplayResourcesListContextualMenu from "./DisplayResourcesListContextualMenu";
import {withContextualMenu} from "../../../contexts/ContextualMenuContext";
import sanitizeUrl, {urlProtocols} from "../../../lib/Sanitize/sanitizeUrl";
import {Trans, withTranslation} from "react-i18next";
import {DateTime} from "luxon";

/**
 * This component allows to display the filtered resources into a grid
 */
class DisplayResourcesList extends React.Component {
  /**
   * Default constructor
   * @param props Component props
   */
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.initEventHandlers();
    this.handleFavoriteClickDebounced = debounce(this.handleFavoriteUpdate, 200);
    this.createRefs();
  }

  /**
   * Returns the component default state
   */
  getDefaultState() {
    return {
      resources: [], // The current list of resources to display
      selectStrategy: "",
      previewedPassword: null, // The previewed password.
    };
  }

  /**
   * Initialize the component event handlers
   */
  initEventHandlers() {
    this.handleSelectAllChange = this.handleSelectAllChange.bind(this);
    this.handleResourceSelected = this.handleResourceSelected.bind(this);
    this.handleResourceRightClick = this.handleResourceRightClick.bind(this);
    this.handleCheckboxWrapperClick = this.handleCheckboxWrapperClick.bind(this);
    this.handleCopyPasswordClick = this.handleCopyPasswordClick.bind(this);
    this.handleCopyUsernameClick = this.handleCopyUsernameClick.bind(this);
    this.handleFavoriteClick = this.handleFavoriteClick.bind(this);
    this.handleSortByColumnClick = this.handleSortByColumnClick.bind(this);
    this.handleGoToResourceUriClick = this.handleGoToResourceUriClick.bind(this);
    this.handlePreviewPasswordButtonClick = this.handlePreviewPasswordButtonClick.bind(this);
  }

  /**
   * Whenever the component has been updated
   */
  componentDidUpdate() {
    this.handleResourceScroll();
  }

  /**
   * Returns true if the component should be re-rendered
   */
  shouldComponentUpdate(prevProps, prevState) {
    const {filteredResources, selectedResources, sorter, scrollTo} = this.props.resourceWorkspaceContext;
    const hasFilteredResourcesChanged = prevProps.resourceWorkspaceContext.filteredResources !== filteredResources;
    const hasBothSingleSelection = selectedResources.length === 1 && prevProps.resourceWorkspaceContext.selectedResources.length === 1;
    const hasSingleSelectedResourceChanged = hasBothSingleSelection && selectedResources[0].id !== prevProps.resourceWorkspaceContext.selectedResources[0].id;
    const hasSelectedResourcesLengthChanged = prevProps.resourceWorkspaceContext.selectedResources.length !== selectedResources.length;
    const hasSorterChanged = sorter !== prevProps.resourceWorkspaceContext.sorter;
    const hasResourceToScrollChange = Boolean(scrollTo.resource && scrollTo.resource.id);
    const hasResourcePreviewPasswordChange = prevState.previewedPassword !== this.state.previewedPassword;
    const mustHidePreviewPassword = hasFilteredResourcesChanged || hasSingleSelectedResourceChanged || hasSelectedResourcesLengthChanged || hasSorterChanged;
    if (mustHidePreviewPassword) {
      this.hidePreviewedPassword();
    }
    return hasFilteredResourcesChanged ||
      hasSelectedResourcesLengthChanged ||
      hasSingleSelectedResourceChanged ||
      hasSorterChanged ||
      hasResourceToScrollChange ||
      hasResourcePreviewPasswordChange;
  }

  /**
   * Create DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createRefs() {
    this.listRef = React.createRef();
    this.dragFeedbackElement = React.createRef();
  }

  /**
   * Handle the All resources selection
   * @param event The DOM event
   */
  handleSelectAllChange(event) {
    const checked = event.target.checked;
    const operationName = checked ? "all" : "none";
    this.props.resourceWorkspaceContext.onResourceSelected[operationName]();
  }

  /**
   * Handle the resource selection
   * @param event The DOM event
   * @param resource The selected resource
   */
  async handleResourceSelected(event, resource) {
    event.preventDefault();
    event.stopPropagation();

    await this.selectResource(resource, event);
  }

  /**
   * Handle when the user selects an element in the grid.
   * @param {array} resources The selected resources
   */
  handleSelectResources(resources) {
    const selectedFolders = [];
    const selectedResources = resources;
    this.setState({selectedFolders, selectedResources}, () => {
      if (resources.length === 1) {
        this.props.history.push(`/app/passwords/view/${resources[0].id}`);
      }
    });
  }

  /**
   * Handle the right click on a resource
   * @param event
   * @param resource
   */
  handleResourceRightClick(event, resource) {
    // Prevent the default contextual menu to popup.
    event.preventDefault();
    this.handleSelectResources([resource]);
    const left = event.pageX;
    const top = event.pageY;
    const contextualMenuProps = {left, top, resource};
    this.props.contextualMenuContext.show(DisplayResourcesListContextualMenu, contextualMenuProps);
  }

  async handleCheckboxWrapperClick(event, resource) {
    /*
     * We want the td to extend the clickable area of the checkbox.
     * If we propagate the event, the tr will listen to the click and select only the clicked row.
     */
    event.stopPropagation();
    const isRangeSelection = event && event.shiftKey;

    if (isRangeSelection) {
      await this.props.resourceWorkspaceContext.onResourceSelected.range(resource);
    } else {
      await this.props.resourceWorkspaceContext.onResourceSelected.multiple(resource);
    }
  }

  /**
   * Handles the initial resource scroll ( with a specific manual resource url /password/view/:id )
   */
  handleResourceScroll() {
    const resourceToScroll = this.props.resourceWorkspaceContext.scrollTo.resource;
    if (resourceToScroll) {
      this.scrollTo(resourceToScroll.id);
      this.props.resourceWorkspaceContext.onResourceScrolled();
    }
  }

  /**
   * Returns the current list of filtered resources to display
   */
  get resources() {
    return this.props.resourceWorkspaceContext.filteredResources;
  }

  /**
   * Returns the current list of selected resources
   */
  get selectedResources() {
    return this.props.resourceWorkspaceContext.selectedResources;
  }

  /**
   * Returns true if the logged in user can use the preview password capability.
   * @returns {boolean}
   */
  get canUsePreviewPassword() {
    return this.props.context.siteSettings.canIUse('previewPassword');
  }

  /**
   * Returns true if the given resource is selected
   * @param resource A resource
   */
  isResourceSelected(resource) {
    return this.props.resourceWorkspaceContext.selectedResources.some(selectedResource => resource.id === selectedResource.id);
  }

  async handleCopyUsernameClick(ev, resource) {
    // Avoid the grid to select the resource while copying a resource username.
    ev.stopPropagation();

    await this.props.context.port.request("passbolt.clipboard.copy", resource.username);
    this.props.actionFeedbackContext.displaySuccess(this.translate("The username has been copied to clipboard"));
  }

  /**
   * Handle copy password button click.
   */
  async handleCopyPasswordClick(ev, resource) {
    // Avoid the grid to select the resource while copying a resource secret.
    ev.stopPropagation();

    await this.copyPasswordToClipboard(resource.id);
  }

  /**
   * Handle preview password button click.
   */
  async handlePreviewPasswordButtonClick(ev, resourceId) {
    // Avoid the grid to select the resource while previewing its secret.
    ev.stopPropagation();

    await this.togglePreviewPassword(resourceId);
  }

  /**
   * Get the password property from a secret plaintext object.
   * @param {string|object} plaintextDto The secret plaintext
   * @returns {string}
   */
  extractPlaintextPassword(plaintextDto) {
    if (!plaintextDto) {
      throw new TypeError(this.translate("The secret plaintext is empty."));
    }
    if (typeof plaintextDto === 'string') {
      return plaintextDto;
    }
    if (typeof plaintextDto !== 'object') {
      throw new TypeError('The secret plaintext must be a string or an object.');
    }
    if (!Object.prototype.hasOwnProperty.call(plaintextDto, 'password')) {
      throw new TypeError('The secret plaintext must have a password property.');
    }
    return plaintextDto.password;
  }

  /**
   * Copy a resource secret to clipboard.
   * @param {string} resourceId The target resource id
   * @returns {Promise<void>}
   */
  async copyPasswordToClipboard(resourceId) {
    let password;

    if (this.isPasswordPreviewed(resourceId)) {
      password = this.state.previewedPassword.password;
    } else {
      try {
        const plaintext = await this.decryptResourceSecret(resourceId);
        password = this.extractPlaintextPassword(plaintext);
      } catch (error) {
        if (error.name !== "UserAbortsOperationError") {
          this.props.actionFeedbackContext.displayError(error.message);
        }
        return;
      }
    }
    await this.props.context.port.request("passbolt.clipboard.copy", password);
    await this.props.resourceWorkspaceContext.onResourceCopied();
    await this.props.actionFeedbackContext.displaySuccess(this.translate("The secret has been copied to clipboard"));
  }

  /**
   * Toggle preview password for a given resource
   * @param {string} resourceId The resource id to preview the password for
   * @returns {Promise<void>}
   */
  async togglePreviewPassword(resourceId) {
    const isPasswordPreviewedPreviewed = this.isPasswordPreviewed(resourceId);
    if (isPasswordPreviewedPreviewed) {
      this.hidePreviewedPassword();
    } else {
      await this.previewPassword(resourceId);
    }
  }

  /**
   * Hide the previewed resource password.
   */
  hidePreviewedPassword() {
    this.setState({previewedPassword: null});
  }

  /**
   * Preview password for a given resource
   * @param {string} resourceId The resource id to preview the password for
   * @returns {Promise<void>}
   */
  async previewPassword(resourceId) {
    let password;
    try {
      const plaintext = await this.decryptResourceSecret(resourceId);
      password = this.extractPlaintextPassword(plaintext);
      const previewedPassword = {resourceId, password};
      this.setState({previewedPassword});
    } catch (error) {
      if (error.name !== "UserAbortsOperationError") {
        this.props.actionFeedbackContext.displayError(error.message);
      }
    }
  }

  /**
   * Decrypt the resource secret
   * @param {string} resourceId The target resource id
   * @returns {Promise<object>} The secret in plaintext format
   * @throw UserAbortsOperationError If the user cancel the operation
   */
  decryptResourceSecret(resourceId) {
    return this.props.context.port.request("passbolt.secret.decrypt", resourceId, {showProgress: true});
  }

  async handleFavoriteClick(event, resource) {
    event.stopPropagation();
    await this.handleFavoriteClickDebounced(resource);
  }

  handleFavoriteUpdate(resource) {
    if (resource.favorite === null) {
      this.favoriteResource(resource);
    } else {
      this.unfavoriteResource(resource);
    }
  }

  /**
   * Handle the resource sorter change
   * @param event A DOM event
   * @param sortProperty The resource property to sort on
   */
  async handleSortByColumnClick(event, sortProperty) {
    this.props.resourceWorkspaceContext.onSorterChanged(sortProperty);
  }

  /**
   * Handle the drag start on the selected resource
   * @param event The DOM event
   * @param resource The selected resource
   * @returns {Promise<void>}
   */
  async handleDragStartEvent(event, resource) {
    event.persist();
    if (!this.isResourceSelected(resource)) {
      await this.props.resourceWorkspaceContext.onResourceSelected.single(resource);
    }
    event.dataTransfer.setDragImage(this.dragFeedbackElement.current, 5, 5);
    const draggedItems = {resources:  this.props.resourceWorkspaceContext.selectedResources, folders: []};
    const triggerEvent = document.createEvent("CustomEvent");
    triggerEvent.initCustomEvent("passbolt.resources.drag-start", true, true, draggedItems);
    document.dispatchEvent(triggerEvent);
  }

  handleDragEndEvent() {
    const trigerEvent = document.createEvent("CustomEvent");
    trigerEvent.initCustomEvent("passbolt.resources.drag-end", true, true);
    document.dispatchEvent(trigerEvent);
  }

  /**
   * Select the resource given the selection event.
   * If no event is provided, the selection is considered as multiple
   * @param resource
   */
  async selectResource(resource, event) {
    const isMultipleSelection = event && event.metaKey;
    const isRangeSelection = event && event.shiftKey;
    const hasNoEvent = !event;

    if (hasNoEvent || isMultipleSelection) {
      await this.props.resourceWorkspaceContext.onResourceSelected.multiple(resource);
    } else if (isRangeSelection) {
      await this.props.resourceWorkspaceContext.onResourceSelected.range(resource);
    } else {
      await this.props.resourceWorkspaceContext.onResourceSelected.single(resource);
    }
  }



  async favoriteResource(resource) {
    try {
      await this.props.context.port.request('passbolt.favorite.add', resource.id);
      this.displaySuccessNotification(this.translate("The password has been added as a favorite"));
    } catch (error) {
      this.displayErrorNotification(error.message);
    }
  }

  async unfavoriteResource(resource) {
    try {
      await this.props.context.port.request('passbolt.favorite.delete', resource.id);
      this.displaySuccessNotification(this.translate("The password has been removed from favorites"));
    } catch (error) {
      this.displayErrorNotification(error.message);
    }
  }

  /**
   * Display success notification (toaster)
   * @param message
   */
  displaySuccessNotification(message) {
    this.props.actionFeedbackContext.displaySuccess(message);
  }

  /**
   * Display error notification (toaster)
   * @param message
   */
  displayErrorNotification(message) {
    this.props.actionFeedbackContext.displayError(message);
  }

  scrollTo(resourceId) {
    if (this.listRef.current !== null) {
      const resourceIndex = this.resources.findIndex(resource => resource.id === resourceId);
      const [visibleStartIndex, visibleEndIndex] = this.listRef.current.getVisibleRange();
      const isInvisible = resourceIndex < visibleStartIndex || resourceIndex > visibleEndIndex;

      if (isInvisible) {
        this.listRef.current.scrollTo(resourceIndex);
      }
    }
  }

  renderTable(items, ref) {
    const tableStyle = {
      MozUserSelect: "none",
      WebkitUserSelect: "none",
      msUserSelect: "none"
    };
    return (
      <table style={tableStyle}>
        <tbody ref={ref}>
          {items}
        </tbody>
      </table>
    );
  }

  /**
   * Check if the grid is sorted for a given column
   * @param column The column name
   */
  isSortedColumn(column) {
    return this.props.resourceWorkspaceContext.sorter.propertyName === column;
  }

  /**
   * Check if the sort is ascendant.
   * @returns {boolean}
   */
  isSortedAsc() {
    return this.props.resourceWorkspaceContext.sorter.asc;
  }

  /**
   * Whenever the user wants to follow a resource uri.
   * @param {object} resource The resource
   */
  handleGoToResourceUriClick(resource) {
    this.props.resourceWorkspaceContext.onGoToResourceUriRequested(resource);
  }

  /**
   * Check if the password of the given resource is previewed.
   * @param {string} resourceId The resource id
   * @returns {boolean}
   */
  isPasswordPreviewed(resourceId) {
    return this.state.previewedPassword && this.state.previewedPassword.resourceId === resourceId;
  }

  /**
   * Get safe uri of a resource
   * @param {object} resource The resource to get the safe uri for
   * @return {string}
   */
  safeUri(resource) {
    return sanitizeUrl(
      resource.uri, {
        whiteListedProtocols: resourceLinkAuthorizedProtocols,
        defaultProtocol: urlProtocols.HTTPS
      }) || "";
  }

  /**
   * Format date in time ago
   * @param {string} date The date to format
   * @return {string}
   */
  formatDateTimeAgo(date) {
    const dateTime = DateTime.fromISO(date);
    const duration = dateTime.diffNow().toMillis();
    return duration > -1000 && duration < 0 ? this.translate('Just now') : dateTime.toRelative({locale: this.props.context.locale});
  }

  renderItem(index, key) {
    const resource = this.resources[index];
    const isSelected = this.isResourceSelected(resource);
    const isFavorite = resource.favorite !== null && resource.favorite !== undefined;
    const safeUri = this.safeUri(resource);
    const modifiedFormatted = this.formatDateTimeAgo(resource.modified);
    const isPasswordPreviewed = this.isPasswordPreviewed(resource.id);

    return (
      <tr id={`resource_${resource.id}`} key={key} draggable="true" className={isSelected ? "selected" : ""}
        unselectable={this.state.selectStrategy === "range" ? "on" : ""}
        onClick={ev => this.handleResourceSelected(ev, resource)}
        onContextMenu={ev => this.handleResourceRightClick(ev, resource)}
        onDragStart={event => this.handleDragStartEvent(event, resource)}
        onDragEnd={event => this.handleDragEndEvent(event, resource)}>
        <td className="cell-multiple-select selections s-cell"
          onClick={ev => this.handleCheckboxWrapperClick(ev, resource)}>
          <div className="ready">
            <div className="input checkbox">
              <input type="checkbox" id={`checkbox_multiple_select_checkbox_${resource.id}`} checked={isSelected} readOnly={true}/>
              <label htmlFor={`checkbox_multiple_select_checkbox_${resource.id}`}></label>
            </div>
          </div>
        </td>
        <td className="cell-favorite selections s-cell">
          <div className="ready">
            <a className={`no-text ${isFavorite ? "fav" : "unfav"}`} onClick={ev => this.handleFavoriteClick(ev, resource)}>
              <Icon baseline={true} name="star"/>
              <span className="visuallyhidden">fav</span>
            </a>
          </div>
        </td>
        <td className="cell-name m-cell uri">
          <div title={resource.name}>
            {resource.name}
          </div>
        </td>
        <td className="cell-username m-cell username">
          <div title={resource.username}>
            <a onClick={ev => this.handleCopyUsernameClick(ev, resource)}>{resource.username}</a>
          </div>
        </td>
        <td className="cell-secret m-cell password">
          <div className={`secret ${isPasswordPreviewed ? "" : "secret-copy"}`}
            title={isPasswordPreviewed ? this.state.previewedPassword.password : "secret"}>
            <a onClick={async ev => this.handleCopyPasswordClick(ev, resource)}>
              <span>
                {isPasswordPreviewed && this.state.previewedPassword.password}
                {!isPasswordPreviewed && "Copy password to clipboard"}
              </span>
            </a>
          </div>
          {this.canUsePreviewPassword &&
          <a onClick={async ev => this.handlePreviewPasswordButtonClick(ev, resource.id)}
            className={`password-view button button-icon button-toggle ${this.isPasswordPreviewed(resource.id) ? "selected" : ""}`}>
            <Icon name='eye-open' baseline={true}/>
            <span className="visually-hidden">view</span>
          </a>
          }
        </td>
        <td className="cell-uri l-cell">
          <div title={resource.uri}>
            {safeUri &&
            <a onClick={() => this.handleGoToResourceUriClick(resource)}>{resource.uri}</a>
            }
            {!safeUri &&
            <span>{resource.uri}</span>
            }
          </div>
        </td>
        <td className="cell-modified m-cell">
          <div title={resource.modified}>
            {modifiedFormatted}
          </div>
        </td>
      </tr>
    );
  }

  /**
   * Render the drag tooltip of the selected resources
   * @returns {JSX.Element}
   */
  renderDragFeedback() {
    const isSelected = this.props.resourceWorkspaceContext.selectedResources.length > 0;
    const isMultipleSelected = this.props.resourceWorkspaceContext.selectedResources.length > 1;
    let dragFeedbackText = "";
    let dragElementClassname = "";

    if (isSelected) {
      const isSelected = resource => resource.id === this.props.resourceWorkspaceContext.selectedResources[0].id;
      const firstSelectedResource = this.resources.find(isSelected);
      if (firstSelectedResource) {
        dragElementClassname = isMultipleSelected ? "drag-and-drop-multiple" : "drag-and-drop";
        dragFeedbackText = firstSelectedResource.name;
      }
    }

    return (
      <div ref={this.dragFeedbackElement} className={dragElementClassname}>
        {dragFeedbackText}
        {isMultipleSelected &&
        <span className="count">
          {this.props.resourceWorkspaceContext.selectedResources.length}
        </span>
        }
      </div>
    );
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
  }

  render() {
    const isReady = this.resources !== null;
    const isEmpty = isReady && this.resources.length === 0;
    const selectAll = isReady && this.resources.length === this.selectedResources.length;
    const filterType = this.props.resourceWorkspaceContext.filter.type;

    return (
      <div className={`tableview ready ${isEmpty ? "empty" : ""} ${["default", "modified"].includes(filterType) ? "all_items" : ""}`}>
        <React.Fragment>
          {isEmpty && filterType === ResourceWorkspaceFilterTypes.TEXT &&
          <div className="empty-content">
            <h2><Trans>None of your passwords matched this search.</Trans></h2>
            <p><Trans>Try another search or use the left panel to navigate into your passwords.</Trans></p>
          </div>
          }
          {isEmpty && filterType === ResourceWorkspaceFilterTypes.FAVORITE &&
          <div className="empty-content">
            <h2><Trans>None of your passwords are yet marked as favorite.</Trans></h2>
            <p><Trans>Add stars to passwords you want to easily find later.</Trans></p>
          </div>
          }
          {isEmpty && filterType === ResourceWorkspaceFilterTypes.GROUP &&
          <div className="empty-content">
            <h2><Trans>No passwords are shared with this group yet.</Trans></h2>
            <p><Trans>Share a password with this group or wait for a team member to share one with this group.</Trans></p>
          </div>
          }
          {isEmpty && filterType === ResourceWorkspaceFilterTypes.FOLDER &&
          <div className="empty-content">
            <h2><Trans>No passwords in this folder yet.</Trans></h2>
            <p><Trans>It does feel a bit empty here.</Trans></p>
          </div>
          }
          {isEmpty &&  filterType === ResourceWorkspaceFilterTypes.SHARED_WITH_ME &&
          <div className="empty-content">
            <h2><Trans>No passwords are shared with you yet.</Trans></h2>
            <p>
              <Trans>It does feel a bit empty here.</Trans>&nbsp;
              <Trans>Wait for a team member to share a password with you.</Trans>
            </p>
          </div>
          }
          {isEmpty &&
          (filterType === ResourceWorkspaceFilterTypes.ITEMS_I_OWN ||
            filterType === ResourceWorkspaceFilterTypes.RECENTLY_MODIFIED ||
            filterType === ResourceWorkspaceFilterTypes.ALL
          ) &&
          <React.Fragment>
            <div className="empty-content">
              <h1><Trans>Welcome to passbolt!</Trans></h1>
              <p>
                <Trans>It does feel a bit empty here.</Trans>&nbsp;
                <Trans>Create your first password or wait for a team member to share one with you.</Trans>
              </p>
            </div>
          </React.Fragment>
          }
          {!isEmpty &&
          <React.Fragment>
            {this.renderDragFeedback()}
            <div className="tableview-header">
              <table>
                <thead>
                  <tr>
                    <th className="cell-multiple-select selections s-cell">
                      <div className="input checkbox">
                        <input
                          type="checkbox"
                          name="select all"
                          checked={selectAll}
                          onChange={this.handleSelectAllChange}/>
                        <label htmlFor="js-passwords-select-all">select all</label>
                      </div>
                    </th>
                    <th className="cell-favorite selections s-cell sortable">
                      <a onClick={ev => this.handleSortByColumnClick(ev, "favorite")} className="unfav">
                        <Icon baseline={true} name="star"/>
                        <span className="visuallyhidden">fav</span>
                        {this.isSortedColumn("favorite") && this.isSortedAsc() &&
                        <Icon baseline={true} name="caret-up"/>
                        }
                        {this.isSortedColumn("favorite") && !this.isSortedAsc() &&
                        <Icon baseline={true} name="caret-down"/>
                        }
                      </a>
                    </th>
                    <th className="cell-name m-cell sortable">
                      <a onClick={ev => this.handleSortByColumnClick(ev, "name")}>
                        <div className="cell-header">
                          <span className="cell-header-text">
                            <Trans>Resource</Trans>
                          </span>
                          <span className="cell-header-icon-sort">
                            {this.isSortedColumn("name") && this.isSortedAsc() &&
                            <Icon baseline={true} name="caret-up"/>
                            }
                            {this.isSortedColumn("name") && !this.isSortedAsc() &&
                            <Icon baseline={true} name="caret-down"/>
                            }
                          </span>
                        </div>
                      </a>
                    </th>
                    <th className="cell-username m-cell username sortable">
                      <a onClick={ev => this.handleSortByColumnClick(ev, "username")}>
                        <div className="cell-header">
                          <span className="cell-header-text">
                            <Trans>Username</Trans>
                          </span>
                          <span className="cell-header-icon-sort">
                            {this.isSortedColumn("username") && this.isSortedAsc() &&
                            <Icon baseline={true} name="caret-up"/>
                            }
                            {this.isSortedColumn("username") && !this.isSortedAsc() &&
                            <Icon baseline={true} name="caret-down"/>
                            }
                          </span>
                        </div>
                      </a>
                    </th>
                    <th className="cell-secret m-cell password">
                      <div className="cell-header">
                        <span className="cell-header-text">
                          <Trans>Password</Trans>
                        </span>
                      </div>
                    </th>
                    <th className="cell-uri l-cell sortable">
                      <a onClick={ev => this.handleSortByColumnClick(ev, "uri")}>
                        <div className="cell-header">
                          <span className="cell-header-text">
                            <Trans>URI</Trans>
                          </span>
                          <span className="cell-header-icon-sort">
                            {this.isSortedColumn("uri") && this.isSortedAsc() &&
                            <Icon baseline={true} name="caret-up"/>
                            }
                            {this.isSortedColumn("uri") && !this.isSortedAsc() &&
                            <Icon baseline={true} name="caret-down"/>
                            }
                          </span>
                        </div>
                      </a>
                    </th>
                    <th className="cell-modified m-cell sortable">
                      <a onClick={ev => this.handleSortByColumnClick(ev, "modified")}>
                        <div className="cell-header">
                          <span className="cell-header-text">
                            <Trans>Modified</Trans>
                          </span>
                          <span className="cell-header-icon-sort">
                            {this.isSortedColumn("modified") && this.isSortedAsc() &&
                            <Icon baseline={true} name="caret-up"/>
                            }
                            {this.isSortedColumn("modified") && !this.isSortedAsc() &&
                            <Icon baseline={true} name="caret-down"/>
                            }
                          </span>
                        </div>
                      </a>
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            {isReady &&
            <div className="tableview-content scroll">
              <ReactList
                itemRenderer={(index, key) => this.renderItem(index, key)}
                itemsRenderer={(items, ref) => this.renderTable(items, ref)}
                length={this.resources.length}
                pageSize={20}
                minSize={20}
                type="uniform"
                ref={this.listRef}>
              </ReactList>
            </div>
            }
          </React.Fragment>
          }
        </React.Fragment>
      </div>
    );
  }
}


DisplayResourcesList.propTypes = {
  context: PropTypes.any, // The app context
  resourceWorkspaceContext: PropTypes.any,
  actionFeedbackContext: PropTypes.any, // The action feedback context
  contextualMenuContext: PropTypes.any, // The contextual menu context
  history: PropTypes.any,
  t: PropTypes.func, // The translation function
};

export default withAppContext(withRouter(withActionFeedback(withContextualMenu(withResourceWorkspace(withTranslation('common')(DisplayResourcesList))))));
