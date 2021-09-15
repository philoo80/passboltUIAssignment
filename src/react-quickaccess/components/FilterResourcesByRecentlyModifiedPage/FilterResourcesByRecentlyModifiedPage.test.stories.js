import React from "react";
import {MemoryRouter, Route} from "react-router-dom";
import "../../../css/themes/default/ext_quickaccess.css";
import PropTypes from "prop-types";
import FilterResourcesByRecentlyModifiedPage from "./FilterResourcesByRecentlyModifiedPage";
import AppContext from "../../contexts/AppContext";
import {defaultAppContext, mockNoResource, mockResources} from "./FilterResourcesByRecentlyModifiedPage.test.data";


export default {
  title: 'Passbolt/QuickAccess/FilterResourcesByRecentlyModified',
  component: FilterResourcesByRecentlyModifiedPage
};

const Template = ({context, ...args}) =>
  <AppContext.Provider value={context}>
    <MemoryRouter initialEntries={['/']}>
      <Route component={routerProps => <div className="container page quickaccess"><FilterResourcesByRecentlyModifiedPage {...args} {...routerProps}/></div>}/>
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
  storage: {
    local: {
      get: () => mockNoResource
    }
  }
};
export const NoRecentlyModifiedResource = Template.bind({});
NoRecentlyModifiedResource.args = {
  context: defaultAppContext(contextNoResource)
};

const contextResources = {
  storage: {
    local: {
      get: () => mockResources
    }
  }
};
export const RecentlyModifiedResources = Template.bind({});
RecentlyModifiedResources.args = {
  context: defaultAppContext(contextResources)
};




