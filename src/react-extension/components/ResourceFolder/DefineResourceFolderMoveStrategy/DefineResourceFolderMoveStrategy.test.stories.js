import React from "react";
import {MemoryRouter, Route} from "react-router-dom";
import "../../../../css/themes/default/ext_app.css";
import AppContext from "../../../contexts/AppContext";
import PropTypes from "prop-types";
import DefineResourceFolderMoveStrategy from "./DefineResourceFolderMoveStrategy";


export default {
  title: 'Passbolt/ResourceFolder/DefineResourceFolderMoveStrategy',
  component: DefineResourceFolderMoveStrategy
};

const defaultContext = {
  folders: [
    {id: 1, name: "My folder"}
  ],
  folderMoveStrategyProps: {
    folders: [
      {id: 1}
    ]
  },
  setContext: () => {}
};

const Template = ({context, ...args}) =>
  <AppContext.Provider value={context}>
    <MemoryRouter initialEntries={['/']}>
      <Route component={routerProps => <DefineResourceFolderMoveStrategy {...args} {...routerProps}/>}></Route>
    </MemoryRouter>
  </AppContext.Provider>;

Template.propTypes = {
  context: PropTypes.object,
};

export const Initial = Template.bind({});
Initial.args = {
  context: defaultContext
};


Initial.argTypes = {
  context: {
    control: {
      type: 'object'
    }
  }
};





