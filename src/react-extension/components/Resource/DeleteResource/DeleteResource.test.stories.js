import {MemoryRouter, Route} from "react-router-dom";
import React from "react";
import AppContext from "../../../contexts/AppContext";
import DeleteResource from "./DeleteResource";


export default {
  title: 'Passbolt/Resource/DeleteResource',
  component: DeleteResource
};

const Template = context => args =>
  <AppContext.Provider value={context}>
    <MemoryRouter initialEntries={['/']}>
      <Route component={routerProps => <DeleteResource {...args} {...routerProps}/>}></Route>
    </MemoryRouter>
  </AppContext.Provider>;

const singleContext = {
  passwordDeleteDialogProps: {
    resources: [
      {name: "My Password"}
    ]
  },
};
export const SinglePassword = Template(singleContext).bind({});

const multipleContext = {
  passwordDeleteDialogProps: {
    resources: [
      {name: "My Password"},
      {name: "My Another Password"}
    ]
  },
};
export const MultiplePassword = Template(multipleContext).bind({});
