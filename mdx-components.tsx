import React from "react";
import type { MDXComponents } from "mdx/types";

import Table from "@/components/table";
import PracticeMCQ_BaseVsDerived from "@/components/h2_phy_measurements/physical_quantities_prefixes/PracticeMCQ_BaseVsDerived";
import PracticeMCQ_PrefixesConversion from "@/components/h2_phy_measurements/physical_quantities_prefixes/PracticeMCQ_PrefixesConversion";
import PracticeMCQ_Homogenity from "@/components/h2_phy_measurements/physical_quantities_prefixes/PracticeMCQ_Homogenity";
import InlineCitation from "@/components/InlineCitation";
import PracticeMCQ_Uncertainty_Instrument from "@/components/h2_phy_measurements/errors_and_uncertainties/PracticeMCQ_Uncertainty_Instrument";
import ContentContainer from "./components/ContentContainter";
import VectorAdditionSimulationHeadToTail from "./components/h2_phy_measurements/scalar_and_vector/VetorAdditionSimulationHeadToTail";
import VectorResolutionSimulation from "./components/h2_phy_measurements/scalar_and_vector/VectorResolutionSimulation";
import Vector1DSimulation from "./components/h2_phy_measurements/scalar_and_vector/Vector1DSimulation";
import VectorAdditionSimulationParallelogram from "./components/h2_phy_measurements/scalar_and_vector/VectorAdditionSimulationParallelogram";
// import other MDX components here later

export function useMDXComponents(
  components: MDXComponents
): MDXComponents {
  return {
    // ====== Typography ======
    h1: (props) => (
      <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
    ),
    h2: (props) => (
      <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
    ),
    p: (props) => (
      <p className="my-2 leading-relaxed" {...props} />
    ),
    code: (props) => (
      <code className="bg-gray-100 rounded px-1 py-0.5 font-mono text-sm" {...props} />
    ),

    // ====== Custom components ======
    Table,
    InlineCitation,
    PracticeMCQ_BaseVsDerived,
    PracticeMCQ_PrefixesConversion,
    PracticeMCQ_Homogenity,
    PracticeMCQ_Uncertainty_Instrument,
    ContentContainer,
    VectorAdditionSimulationHeadToTail,
    VectorResolutionSimulation,
    Vector1DSimulation,
    VectorAdditionSimulationParallelogram,

    // allow overrides
    ...components,
  };
}
