import React from "react";
import {MemoryRouter, Route} from "react-router-dom";
import "../../../css/themes/default/ext_quickaccess.css";
import PropTypes from "prop-types";
import FilterResourcesByItemsIOwnPage from "./FilterResourcesByItemsIOwnPage";
import AppContext from "../../contexts/AppContext";
import {defaultAppContext, mockResources} from "./FilterResourcesByItemsIOwnPage.test.data";


export default {
  title: 'Passbolt/QuickAccess/FilterResourcesByItemsIOwn',
  component: FilterResourcesByItemsIOwnPage
};

const Template = ({context, ...args}) =>
  <AppContext.Provider value={context}>
    <MemoryRouter initialEntries={['/']}>
      <Route component={routerProps => <div className="container page quickaccess"><FilterResourcesByItemsIOwnPage {...args} {...routerProps}/></div>}/>
    </MemoryRouter>
  </AppContext.Provider>;

Template.propTypes = {
  context: PropTypes.object,
};



export const InitialLoad = Template.bind({});
InitialLoad.args = {
  context: defaultAppContext()
};

const contextNoItem = {
  port: {
    request: () => []
  }
};
export const NoItemsIOwnResource = Template.bind({});
NoItemsIOwnResource.args = {
  context: defaultAppContext(contextNoItem)
};

const contextResources = {
  port: {
    request: () => mockResources
  }
};
export const ItemsIOwnResources = Template.bind({});
ItemsIOwnResources.args = {
  context: defaultAppContext(contextResources)
};




