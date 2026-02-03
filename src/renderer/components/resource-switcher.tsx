/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";

const titleCaseSplitRegex = /(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/;

const formatResourceKind = (resourceKind: string) => resourceKind.split(titleCaseSplitRegex).join(" ");

type NamespaceOption = Renderer.Component.SelectOption<() => void>;
type StandardResourceOption = Renderer.Component.SelectOption<() => void>;
type CrdOption = Renderer.Component.SelectOption<any>;
type SwitcherOption = NamespaceOption | StandardResourceOption | CrdOption;

const buildStandardResources = (): StandardResourceOption[] => [
  { value: () => Renderer.Navigation.navigate("/overview"), label: "Overview: Cluster Overview" },
  { value: () => Renderer.Navigation.navigate("/workloads"), label: "Workloads: Overview" },
  { value: () => Renderer.Navigation.navigate("/nodes"), label: "Cluster: Nodes" },
  { value: () => Renderer.Navigation.navigate("/namespaces"), label: "Cluster: Namespaces" },
  { value: () => Renderer.Navigation.navigate("/events"), label: "Cluster: Events" },
  { value: () => Renderer.Navigation.navigate("/pods"), label: "Workloads: Pods" },
  { value: () => Renderer.Navigation.navigate("/deployments"), label: "Workloads: Deployments" },
  { value: () => Renderer.Navigation.navigate("/daemonsets"), label: "Workloads: DaemonSets" },
  { value: () => Renderer.Navigation.navigate("/statefulsets"), label: "Workloads: StatefulSets" },
  { value: () => Renderer.Navigation.navigate("/replicasets"), label: "Workloads: ReplicaSets" },
  { value: () => Renderer.Navigation.navigate("/jobs"), label: "Workloads: Jobs" },
  { value: () => Renderer.Navigation.navigate("/cronjobs"), label: "Workloads: CronJobs" },
  { value: () => Renderer.Navigation.navigate("/services"), label: "Network: Services" },
  { value: () => Renderer.Navigation.navigate("/ingresses"), label: "Network: Ingresses" },
  { value: () => Renderer.Navigation.navigate("/ingress-classes"), label: "Network: Ingress Classes" },
  { value: () => Renderer.Navigation.navigate("/network-policies"), label: "Network: NetworkPolicies" },
  { value: () => Renderer.Navigation.navigate("/endpoints"), label: "Network: Endpoints" },
  { value: () => Renderer.Navigation.navigate("/endpoint-slices"), label: "Network: Endpoint Slices" },
  { value: () => Renderer.Navigation.navigate("/port-forwards"), label: "Network: Port Forwarding" },
  { value: () => Renderer.Navigation.navigate("/config-maps"), label: "Config: ConfigMaps" },
  { value: () => Renderer.Navigation.navigate("/secrets"), label: "Config: Secrets" },
  { value: () => Renderer.Navigation.navigate("/resource-quotas"), label: "Config: ResourceQuotas" },
  { value: () => Renderer.Navigation.navigate("/limit-ranges"), label: "Config: LimitRanges" },
  {
    value: () => Renderer.Navigation.navigate("/horizontal-pod-autoscalers"),
    label: "Config: Horizontal Pod Autoscalers",
  },
  {
    value: () => Renderer.Navigation.navigate("/vertical-pod-autoscalers"),
    label: "Config: Vertical Pod Autoscalers",
  },
  { value: () => Renderer.Navigation.navigate("/pod-disruption-budgets"), label: "Config: PodDisruptionBudgets" },
  { value: () => Renderer.Navigation.navigate("/priority-classes"), label: "Config: PriorityClasses" },
  { value: () => Renderer.Navigation.navigate("/leases"), label: "Config: Leases" },
  { value: () => Renderer.Navigation.navigate("/runtime-classes"), label: "Config: Runtime Classes" },
  {
    value: () => Renderer.Navigation.navigate("/mutating-webhook-configurations"),
    label: "Config: MutatingWebhookConfigurations",
  },
  {
    value: () => Renderer.Navigation.navigate("/validating-webhook-configurations"),
    label: "Config: ValidatingWebhookConfigurations",
  },
  { value: () => Renderer.Navigation.navigate("/storage-classes"), label: "Storage: Storage Classes" },
  { value: () => Renderer.Navigation.navigate("/persistent-volumes"), label: "Storage: Persistent Volumes" },
  {
    value: () => Renderer.Navigation.navigate("/persistent-volume-claims"),
    label: "Storage: Persistent Volume Claims",
  },
  { value: () => Renderer.Navigation.navigate("/service-accounts"), label: "Access Control: ServiceAccounts" },
  { value: () => Renderer.Navigation.navigate("/roles"), label: "Access Control: Roles" },
  { value: () => Renderer.Navigation.navigate("/role-bindings"), label: "Access Control: RoleBindings" },
  { value: () => Renderer.Navigation.navigate("/cluster-roles"), label: "Access Control: ClusterRoles" },
  {
    value: () => Renderer.Navigation.navigate("/cluster-role-bindings"),
    label: "Access Control: ClusterRoleBindings",
  },
  {
    value: () => Renderer.Navigation.navigate("/pod-security-policies"),
    label: "Access Control: PodSecurityPolicies",
  },
  { value: () => Renderer.Navigation.navigate("/helm/charts"), label: "Helm: Charts" },
  { value: () => Renderer.Navigation.navigate("/helm/releases"), label: "Helm: Releases" },
  { value: () => Renderer.Navigation.navigate("/crd/definitions"), label: "Custom Resources: Definitions" },
];

export const ResourceSwitcher = observer(() => {
  const [searchValue, setSearchValue] = React.useState("");
  const [highlightValue, setHighlightValue] = React.useState("");

  const crdStore = Renderer.K8sApi.crdStore;
  const namespaceStore = Renderer.K8sApi.namespaceStore;

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => setHighlightValue(searchValue), 150);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  React.useEffect(() => {
    try {
      crdStore.loadAll?.();
      namespaceStore.loadAll?.();
    } catch (error) {
      console.warn("Resource switcher failed to preload stores", error);
    }
  }, [crdStore, namespaceStore]);

  const renderHighlightedLabel = (label: string) => {
    if (!highlightValue.trim()) {
      return label;
    }

    const escaped = highlightValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matcher = new RegExp(escaped, "ig");
    const segments = label.split(matcher);
    const matches = label.match(matcher);

    if (!matches) {
      return label;
    }

    return segments.map((segment, index) => (
      <React.Fragment key={`${segment}-${index}`}>
        {segment}
        {matches[index] ? <strong>{matches[index]}</strong> : null}
      </React.Fragment>
    ));
  };

  const namespaceOptions: NamespaceOption[] = [
    {
      value: () => namespaceStore.selectAll(),
      label: "Namespaces: All namespaces",
    },
    ...namespaceStore.items.map((namespace) => ({
      value: () => namespaceStore.selectSingle(namespace.getName()),
      label: `Namespace: ${namespace.getName()}`,
    })),
  ];

  const standardResourceOptions = buildStandardResources();

  const crdOptions: CrdOption[] = crdStore.items.map((crd) => ({
    value: crd,
    label: `${formatResourceKind(crd.getResourceKind())} — ${crd.getGroup()}/${crd.getVersion()} (${crd.getPluralName()})`,
  }));

  const options: SwitcherOption[] = [...namespaceOptions, ...standardResourceOptions, ...crdOptions];
  const isLoading = crdStore.isLoading && !crdStore.isLoaded;

  return (
    <Renderer.Component.Select<any, SwitcherOption>
      id="resource-switcher-input"
      menuPortalTarget={null}
      getOptionValue={(option) => String(option.label)}
      onChange={(option) => {
        if (!option) {
          return;
        }

        if (typeof option.value === "function") {
          option.value();
          Renderer.Component.CommandOverlay.close();

          return;
        }

        Renderer.Navigation.navigate(`/crd/${option.value.getGroup()}/${option.value.getPluralName()}`);
        Renderer.Component.CommandOverlay.close();
      }}
      onInputChange={(newValue, meta) => {
        if (meta?.action === "input-change") {
          setSearchValue(newValue);
        }

        return newValue;
      }}
      inputValue={searchValue}
      components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      formatOptionLabel={(option) => renderHighlightedLabel(String(option.label))}
      menuIsOpen={true}
      options={options}
      autoFocus={true}
      escapeClearsValue={false}
      isClearable={false}
      isLoading={isLoading}
      loadingMessage={() => "Loading CRDs..."}
      noOptionsMessage={() => (searchValue ? "No matches" : "No resources found")}
      placeholder="Switch to Resource"
    />
  );
});
