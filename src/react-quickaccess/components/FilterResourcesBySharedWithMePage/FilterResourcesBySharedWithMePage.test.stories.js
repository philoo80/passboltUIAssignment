import React from "react";
import {MemoryRouter, Route} from "react-router-dom";
import "../../../css/themes/default/ext_quickaccess.css";
import PropTypes from "prop-types";
import FilterResourcesBySharedWithMePage from "./FilterResourcesBySharedWithMePage";
import AppContext from "../../contexts/AppContext";
import {defaultAppContext, mockResources} from "./FilterResourcesBySharedWithMePage.test.data";


export default {
  title: 'Passbolt/QuickAccess/FilterResourcesBySharedWithMe',
  component: FilterResourcesBySharedWithMePage
};

const Template = ({context, ...args}) =>
  <AppContext.Provider value={context}>
    <MemoryRouter initialEntries={['/']}>
      <Route component={routerProps => <div className="container page quickaccess"><FilterResourcesBySharedWithMePage {...args} {...routerProps}/></div>}/>
    </MemoryRouter>
  </AppContext.Provider>;

Template.propTypes = {
  context: PropTypes.object,
};



export const InitialLoad = Template.bind({});
InitialLoad.args = {
  context: defaultAppContext()
};

const contextNoResource = {
  port: {
    request: () => []
  }
};
export const NoSharedWithMeResource = Template.bind({});
NoSharedWithMeResource.args = {
  context: defaultAppContext(contextNoResource)
};

const contextResources = {
  port: {
    request: () => mockResources
  }
};
export const SharedWithMeResources = Template.bind({});
SharedWithMeResources.args = {
  context: defaultAppContext(contextResources)
};




