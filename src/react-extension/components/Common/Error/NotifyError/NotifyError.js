/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.13.0
 */
import React, {Component} from "react";
import PropTypes from "prop-types";
import DialogCloseButton from "../../Dialog/DialogCloseButton/DialogCloseButton";
import {withAppContext} from "../../../../contexts/AppContext";

class NotifyError extends Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.bindCallbacks();
  }

  /**
   * Bind callbacks methods
   * @return {void}
   */
  bindCallbacks() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * ComponentDidMount
   * Invoked immediately after component is inserted into the tree
   * @return {void}
   */
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  /**
   * componentWillUnmount
   * Invoked immediately before the component is removed from the tree
   * @return {void}
   */
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  /**
   * Get the error dialog title
   * @returns {String|string} return default if string is empty
   */
  getTitle() {
    const contextTitle = this.props.context.errorDialogProps && this.props.context.errorDialogProps.title;
    return contextTitle || this.props.title ||  NotifyError.defaultProps.title;
  }

  /**
   * Get the error dialog main message
   * @returns {String|string} return default if string is empty
   */
  getMessage() {
    const contextMessage = this.props.context.errorDialogProps && this.props.context.errorDialogProps.message;
    return contextMessage || this.props.message ||  NotifyError.defaultProps.message;
  }

  /**
   * Handle key down on the component.
   * @params {ReactEvent} The react event
   */
  handleKeyDown(event) {
    // Close the dialog when the user presses the "ESC" or "Enter" keys.
    if (event.keyCode === 27 || event.keyCode === 13) {
      // Stop the event propagation in order to avoid a parent component to react to this ESC event.
      event.stopPropagation();
      this.props.onClose();
    }
  }

  /**
   * Render the component
   * @return {JSX}
   */
  render() {
    return (
      <div className="dialog-wrapper error-dialog">
        <div className="dialog">
          <div className="dialog-header">
            <h2>{this.getTitle()}</h2>
            <DialogCloseButton onClose={this.props.onClose}/>
          </div>
          <div className="dialog-content">
            <div className="form-content">
              <p>{this.getMessage()}</p>
            </div>
            <div className="submit-wrapper clearfix">
              <a className="button primary warning" onClick={this.props.onClose}>Ok</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

NotifyError.defaultProps = {
  title: "Oops something went wrong.",
  message: "An internal error occurred, please try again later."
};

NotifyError.propTypes = {
  context: PropTypes.any, // The application context
  title: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func
};

export default withAppContext(NotifyError);
