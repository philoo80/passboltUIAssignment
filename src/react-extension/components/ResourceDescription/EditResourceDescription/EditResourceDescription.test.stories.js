import React from "react";
import {MemoryRouter, Route} from "react-router-dom";
import "../../../../css/themes/default/ext_app.css";
import AppContext from "../../../contexts/AppContext";
import MockTranslationProvider from "../../../test/mock/components/Internationalisation/MockTranslationProvider";
import EditResourceDescription from "./EditResourceDescription";
import SiteSettings from "../../../../shared/lib/Settings/SiteSettings";
import siteSettingsFixture from "../../../test/fixture/Settings/siteSettings";
import ResourceTypesSettings from "../../../../shared/lib/Settings/ResourceTypesSettings";
import resourceTypesFixture from "../../../test/fixture/ResourceTypes/resourceTypes";


export default {
  title: 'Passbolt/ResourceDescription/EditResourceDescription',
  component: EditResourceDescription
};

const siteSettings = new SiteSettings(siteSettingsFixture);
const resourceTypesSettings = new ResourceTypesSettings(siteSettings, resourceTypesFixture);

const context = {
  siteSettings: {
    canIUse: () => true,
    settings: {
      app: {
        url: 'some url'
      }
    }
  },
  resourceTypesSettings
};


const Template = args =>
  <MockTranslationProvider>
    <AppContext.Provider value={context}>
      <MemoryRouter initialEntries={['/']}>
        <div className="panel aside">
          <div className="comments">
            <Route component={routerProps => <EditResourceDescription {...args} {...routerProps}/>}></Route>
          </div>
        </div>
      </MemoryRouter>
    </AppContext.Provider>
  </MockTranslationProvider>;



export const Initial = Template.bind({});
Initial.args = {
  resource: {
    "resource_type_id": "669f8c64-242a-59fb-92fc-81f660975fd3"
  }
};


