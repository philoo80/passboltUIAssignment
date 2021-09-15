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

/**
 * The ContextualMenuWrapper has for aim to handle common contextual menus common behavior.
 * You can use it in your component as following
 *
 * <ContextualMenuWrapper
 *   hide={callback_func} // Function to call when the contextual menu request to close itself
 *   left={100} // Left position in absolute to display the contextual menu
 *   top={100}> // Top position in absolute to display the contextual menu
 *   <div>
 *     Your contextual menu content
 *   </div>
 * </ContextualMenuWrapper>
 */
class ContextualMenuWrapper extends Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.createRefs();
    this.bindCallbacks();
  }

  /**
   * Bind class methods callback
   */
  bindCallbacks() {
    this.handleDocumentClickEvent = this.handleDocumentClickEvent.bind(this);
    this.handleDocumentContextualMenuEvent = this.handleDocumentContextualMenuEvent.bind(this);
    this.handleDocumentDragStartEvent = this.handleDocumentDragStartEvent.bind(this);
  }

  /**
   * Create DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createRefs() {
    this.elementRef = React.createRef();
  }

  /**
   * ComponentDidMount
   * Invoked immediately after component is inserted into the tree
   * @return {void}
   */
  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClickEvent);
    document.addEventListener('contextmenu', this.handleDocumentContextualMenuEvent);
    document.addEventListener('dragstart', this.handleDocumentDragStartEvent);
  }

  /**
   * componentWillUnmount
   * Invoked immediately before the component is removed from the tree
   * @return {void}
   */
  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClickEvent);
    document.removeEventListener('contextmenu', this.handleDocumentContextualMenuEvent);
    document.removeEventListener('dragstart', this.handleDocumentDragStartEvent);
  }

  /**
   * Handle click events on document. Hide the component if the click occurred outside of the component.
   * @param {ReactEvent} event The event
   */
  handleDocumentClickEvent(event) {
    // Prevent closing when the user click on an element of the contextual menu
    if (this.elementRef.current.contains(event.target)) {
      return;
    }
    this.props.hide();
  }

  /**
   * Handle contextual menu events on document. Hide the component if the click occurred outside of the component.
   * Don't hide it if a contextual menu event occurred on the FoldersList component, this component props will be
   * updated with new datA.
   * @param {ReactEvent} event The event
   */
  handleDocumentContextualMenuEvent(event) {
    // Prevent closing when the user right clicks on an element of the FoldersTree component title
    if (this.elementRef.current.contains(event.target)) {
      return;
    }
    this.props.hide();
  }

  /**
   * Handle drag start event on document. Hide the component if any.
   */
  handleDocumentDragStartEvent() {
    this.props.hide();
  }

  /**
   * Get the contextual menu style.
   */
  getStyle() {
    return {
      position: "absolute",
      display: "block",
      left: this.props.left,
      top: this.props.top
    };
  }

  /**
   * Render the component
   * @return {JSX}
   */
  render() {
    return (
      <ul ref={this.elementRef} className="contextual-menu" style={this.getStyle()}>
        {this.props.children}
      </ul>
    );
  }
}

ContextualMenuWrapper.propTypes = {
  children: PropTypes.any, // The wrapped content
  left: PropTypes.number, // left position in px of the menu
  hide: PropTypes.func, // Hide the contextual menu
  top: PropTypes.number // top position in px of the menu
};

export default ContextualMenuWrapper;
