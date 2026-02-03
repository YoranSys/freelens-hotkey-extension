/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { ExamplePreferencesStore } from "../common/store";
import { createAvailableVersionPage } from "./components/available-version";
import { ExampleDetails as ExampleDetailsV1alpha1 } from "./details/example-details-v1alpha1";
import { ExampleDetails as ExampleDetailsV1alpha2 } from "./details/example-details-v1alpha2";
import { ExampleIcon } from "./icons";
import { Example as ExampleV1alpha1 } from "./k8s/example/example-v1alpha1";
import { Example as ExampleV1alpha2 } from "./k8s/example/example-v1alpha2";
import {
  ExampleActiveToggleMenuItem as ExampleActiveToggleMenuItem_v1alpha1,
  type ExampleActiveToggleMenuItemProps as ExampleActiveToggleMenuItemProps_v1alpha1,
} from "./menus/example-active-toggle-menu-item-v1alpha1";
import {
  ExampleActiveToggleMenuItem as ExampleActiveToggleMenuItem_v1alpha2,
  type ExampleActiveToggleMenuItemProps as ExampleActiveToggleMenuItemProps_v1alpha2,
} from "./menus/example-active-toggle-menu-item-v1alpha2";
import { ExamplesPage as ExamplesPageV1alpha1 } from "./pages/examples-page-v1alpha1";
import { ExamplesPage as ExamplesPageV1alpha2 } from "./pages/examples-page-v1alpha2";
import { ExamplePreferenceHint, ExamplePreferenceInput } from "./preferences/example-preference";
import { ResourceSwitcher } from "./components/resource-switcher";

export default class ExampleRenderer extends Renderer.LensExtension {
  private resourceSwitcherListener: ((event: KeyboardEvent) => void) | null = null;

  async onActivate() {
    ExamplePreferencesStore.getInstanceOrCreate().loadExtension(this);
    this.registerResourceSwitcherHotkey();
  }

  async onDeactivate() {
    this.unregisterResourceSwitcherHotkey();
  }

  private registerResourceSwitcherHotkey() {
    if (this.resourceSwitcherListener) {
      return;
    }

    const isMacPlatform = () => /Mac|iPhone|iPod|iPad/i.test(window.navigator.platform ?? "");
    const isEditableElement = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      return target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA";
    };

    this.resourceSwitcherListener = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.code !== "KeyK" || isEditableElement(event.target)) {
        return;
      }

      const isMac = isMacPlatform();
      const modifierPressed = isMac ? event.metaKey : event.ctrlKey;
      const otherModifierPressed = isMac ? event.ctrlKey : event.metaKey;

      if (!modifierPressed || otherModifierPressed || event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      Renderer.Component.CommandOverlay.open(<ResourceSwitcher />);
    };

    window.addEventListener("keydown", this.resourceSwitcherListener);
  }

  private unregisterResourceSwitcherHotkey() {
    if (!this.resourceSwitcherListener) {
      return;
    }

    window.removeEventListener("keydown", this.resourceSwitcherListener);
    this.resourceSwitcherListener = null;
  }

  appPreferences = [
    {
      title: "Example Preferences",
      components: {
        Input: () => <ExamplePreferenceInput />,
        Hint: () => <ExamplePreferenceHint />,
      },
    },
  ];

  kubeObjectDetailItems = [
    {
      kind: ExampleV1alpha1.kind,
      apiVersions: ExampleV1alpha1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => (
          <ExampleDetailsV1alpha1 {...props} extension={this} />
        ),
      },
    },
    {
      kind: ExampleV1alpha2.kind,
      apiVersions: ExampleV1alpha2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => (
          <ExampleDetailsV1alpha2 {...props} extension={this} />
        ),
      },
    },
  ];

  clusterPages = [
    {
      id: "example",
      components: {
        Page: () => <ExamplesPageV1alpha1 extension={this} />,
      },
    },
    {
      id: "example",
      components: {
        Page: () => <ExamplesPageV1alpha2 extension={this} />,
      },
    },
    {
      id: "example",
      components: {
        Page: createAvailableVersionPage("Examples", [
          { kubeObjectClass: ExampleV1alpha2, PageComponent: ExamplesPageV1alpha2, version: "v1alpha2" },
          { kubeObjectClass: ExampleV1alpha1, PageComponent: ExamplesPageV1alpha1, version: "v1alpha1" },
        ]),
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "example",
      title: ExampleV1alpha1.crd.title,
      target: { pageId: "example" },
      components: {
        Icon: ExampleIcon,
      },
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: ExampleV1alpha1.kind,
      apiVersions: ExampleV1alpha1.crd.apiVersions,
      components: {
        MenuItem: (props: ExampleActiveToggleMenuItemProps_v1alpha1) => (
          <ExampleActiveToggleMenuItem_v1alpha1 {...props} extension={this} />
        ),
      },
    },
    {
      kind: ExampleV1alpha2.kind,
      apiVersions: ExampleV1alpha2.crd.apiVersions,
      components: {
        MenuItem: (props: ExampleActiveToggleMenuItemProps_v1alpha2) => (
          <ExampleActiveToggleMenuItem_v1alpha2 {...props} extension={this} />
        ),
      },
    },
  ];
}
