/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { ResourceSwitcher } from "./components/resource-switcher";

export default class ExampleRenderer extends Renderer.LensExtension {
  private resourceSwitcherListener: ((event: KeyboardEvent) => void) | null = null;

  async onActivate() {
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
}
