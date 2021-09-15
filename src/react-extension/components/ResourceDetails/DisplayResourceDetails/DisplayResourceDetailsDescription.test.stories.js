import React from "react";
import {MemoryRouter, Route} from "react-router-dom";
import AppContext from "../../../contexts/AppContext";
import "../../../../css/themes/default/ext_app.css";
import UserSettings from "../../../../shared/lib/Settings/UserSettings";
import userSettingsFixture from "../../../test/fixture/Settings/userSettings";
import DisplayResourceDetailsDescription from "./DisplayResourceDetailsDescription";
import TranslationProvider from "../../Common/Internationalisation/TranslationProvider";


export default {
  title: 'Passbolt/ResourceDetails/DisplayResourceDetailsDescription',
  component: DisplayResourceDetailsDescription
};

const context = {
  siteSettings: {
    getServerTimezone: () => new Date().toDateString()
  },
  userSettings: new UserSettings(userSettingsFixture),
  port: {
    request: () => "A resource description"
  }
};

const Template = args =>
  <TranslationProvider loadingPath="/data/locales/{{lng}}/{{ns}}.json">
    <AppContext.Provider value={context}>
      <MemoryRouter initialEntries={['/']}>
        <div className="panel">
          <Route component={routerProps => <DisplayResourceDetailsDescription {...args} {...routerProps}/>}></Route>
        </div>
      </MemoryRouter>
    </AppContext.Provider>
  </TranslationProvider>;

export const DecryptedDescription = Template.bind({});
DecryptedDescription.args = {
  resourceWorkspaceContext: {
    details: {
      resource: {
        description: "A resource description"
      }
    }
  }
};
