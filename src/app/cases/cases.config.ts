export type WbcInfo = {
    id: number;
    parameter: string;
    count: number;
    percentage: number;
    belongs_to: string;
    bold: 'bold' | 'unbold';
    space?: string;
    parent: number;
    show: boolean;
    canClick: boolean;
};

export const WBC_INDEX_POSITION: Record<string, number> = {
    neutrophils: 0, segmented_neutrophils: 1, band_forms: 2,
    lymphocytes: 3, small_lymphocytes: 4, large_lymphocytes: 5, large_granular_lymphocytes: 6,
    reactive_lymphocytes: 7,
    abnormal_lymphocytes: 8, hairy_cells: 9, sezary_cells: 10, other_variants: 11,
    monocytes: 12, eosinophils: 13, basophils: 14,
    immature_granulocytes: 15,
    promyelocytes: 16,
    myelocytes: 17, neutrophilic_myelocytes: 18, eosinophilic_myelocytes: 19, basophilic_myelocytes: 20,
    metamyelocytes: 21, neutrophilic_metamyelocytes: 22, eosinophilic_metamyelocytes: 23, basophilic_metamyelocytes: 24,
    blasts: 25, blasts_non_specific: 26, monoblasts: 27, plasma_cells: 28, promonocytes: 29, prolymphocytes: 30,
    smudge: 31, others: 32, unclassified: 33, stain: 34,
    artifact: 35, nucleated_rbc: 36, giant_platelet: 37, platelet_clump: 38, duplicates: 39
}

const WBC_STATIC: WbcInfo[] = [
    { id: 0, parameter: "Neutrophils", count: 0, percentage: 0, belongs_to: 'neutrophils', bold: "bold", space: "space-1", parent: -1, show: true, canClick: false },
    { id: 1, parameter: "Segmented neutrophils", count: 0, percentage: 0, belongs_to: 'segmented_neutrophils', bold: "unbold", space: "space-1", parent: 0, show: true, canClick: true },
    { id: 2, parameter: "Band forms", count: 0, percentage: 0, belongs_to: 'band_forms', bold: "unbold", space: "space-1", parent: 0, show: true, canClick: true },

    { id: 3, parameter: "Lymphocytes", count: 0, percentage: 0, belongs_to: 'lymphocytes', bold: "bold", space: "space-1", parent: -1, show: true, canClick: false },
    { id: 4, parameter: "Small lymphocytes", count: 0, percentage: 0, belongs_to: 'small_lymphocytes', bold: "unbold", space: "space-1", parent: 3, show: true, canClick: true },
    { id: 5, parameter: "Large lymphocytes", count: 0, percentage: 0, belongs_to: 'large_lymphocytes', bold: "unbold", space: "space-1", parent: 3, show: true, canClick: true },
    { id: 6, parameter: "Large granular lymphocytes", count: 0, percentage: 0, belongs_to: 'large_granular_lymphocytes', bold: "unbold", space: "space-1", parent: 3, show: true, canClick: true },

    { id: 7, parameter: "Reactive lymphocytes", count: 0, percentage: 0, belongs_to: 'reactive_lymphocytes', bold: "bold", space: "", parent: -1, show: true, canClick: true },

    { id: 8, parameter: "Abnormal lymphocytes", count: 0, percentage: 0, belongs_to: 'abnormal_lymphocytes', bold: "bold", space: "", parent: -1, show: true, canClick: false },
    { id: 9, parameter: "Hairy cells", count: 0, percentage: 0, belongs_to: 'hairy_cells', bold: "unbold", space: "space-1", parent: 8, show: true, canClick: true },
    { id: 10, parameter: "Sezary cells", count: 0, percentage: 0, belongs_to: 'sezary_cells', bold: "unbold", space: "space-1", parent: 8, show: true, canClick: true },
    { id: 11, parameter: "Lymphocyte variants", count: 0, percentage: 0, belongs_to: 'other_variants', bold: "unbold", space: "space-1", parent: 8, show: true, canClick: true },

    { id: 12, parameter: "Monocytes", count: 0, percentage: 0, belongs_to: 'monocytes', bold: "bold", space: "", parent: -1, show: true, canClick: true },

    { id: 13, parameter: "Eosinophils", count: 0, percentage: 0, belongs_to: 'eosinophils', bold: "bold", space: "", parent: -1, show: true, canClick: true },

    { id: 14, parameter: "Basophils", count: 0, percentage: 0, belongs_to: 'basophils', bold: "bold", space: "", parent: -1, show: true, canClick: true },

    { id: 15, parameter: "Immature granulocytes", count: 0, percentage: 0, belongs_to: 'immature_granulocytes', bold: "bold", space: "", parent: -1, show: true, canClick: false },

    { id: 16, parameter: "Promyelocytes", count: 0, percentage: 0, belongs_to: 'promyelocytes', bold: "unbold", space: "space-1", parent: 15, show: true, canClick: true },

    { id: 17, parameter: "Myelocytes", count: 0, percentage: 0, belongs_to: 'myelocytes', bold: "unbold", space: "space-1", parent: 15, show: true, canClick: false },
    { id: 18, parameter: "Neutrophilic myelocytes", count: 0, percentage: 0, belongs_to: 'neutrophilic_myelocytes', bold: "unbold", space: "space-2", parent: 17, show: true, canClick: true },
    { id: 19, parameter: "Eosinophilc myelocytes", count: 0, percentage: 0, belongs_to: 'eosinophilic_myelocytes', bold: "unbold", space: "space-2", parent: 17, show: true, canClick: true },
    { id: 20, parameter: "Basophilic myelocytes", count: 0, percentage: 0, belongs_to: 'basophilic_myelocytes', bold: "unbold", space: "space-2", parent: 17, show: true, canClick: true },

    { id: 21, parameter: "Metamyelocytes", count: 0, percentage: 0, belongs_to: 'metamyelocytes', bold: "unbold", space: "space-1", parent: 15, show: true, canClick: false },
    { id: 22, parameter: "Neutrophilic metamyelocytes", count: 0, percentage: 0, belongs_to: 'neutrophilic_metamyelocytes', bold: "unbold", space: "space-2", parent: 21, show: true, canClick: true },
    { id: 23, parameter: "Eosinophilc metamyelocytes", count: 0, percentage: 0, belongs_to: 'eosinophilic_metamyelocytes', bold: "unbold", space: "space-2", parent: 21, show: true, canClick: true },
    { id: 24, parameter: "Basophilic metamyelocytes", count: 0, percentage: 0, belongs_to: 'basophilic_metamyelocytes', bold: "unbold", space: "space-2", parent: 21, show: true, canClick: true },

    { id: 25, parameter: "Blasts", count: 0, percentage: 0, belongs_to: 'blasts', bold: "bold", space: "", parent: -1, show: true, canClick: false },
    { id: 26, parameter: "Non-specific", count: 0, percentage: 0, belongs_to: 'blasts_non_specific', bold: "unbold", space: "space-1", parent: 25, show: true, canClick: true },
    { id: 27, parameter: "Monoblasts", count: 0, percentage: 0, belongs_to: 'monoblasts', bold: "unbold", space: "space-1", parent: 25, show: true, canClick: true },

    { id: 28, parameter: "Plasma cells", count: 0, percentage: 0, belongs_to: 'plasma_cells', bold: "bold", space: "", parent: -1, show: true, canClick: true },

    { id: 29, parameter: "Promonocytes", count: 0, percentage: 0, belongs_to: 'promonocytes', bold: "bold", space: "", parent: -1, show: true, canClick: true },

    { id: 30, parameter: "Prolymphocytes", count: 0, percentage: 0, belongs_to: 'prolymphocytes', bold: "bold", space: "", parent: -1, show: true, canClick: true },

    { id: 31, parameter: "Smdge/Smear cells", count: 0, percentage: 0, belongs_to: 'smudge', bold: "bold", space: "", parent: -1, show: false, canClick: true },

    { id: 32, parameter: "Others", count: 0, percentage: 0, belongs_to: 'others', bold: "bold", space: "", parent: -1, show: false, canClick: false },
    { id: 33, parameter: "Unclassified", count: 0, percentage: 0, belongs_to: 'unclassified', bold: "unbold", space: "space-1", parent: 32, show: false, canClick: true },
    { id: 34, parameter: "Stain or Stain precipitate", count: 0, percentage: 0, belongs_to: 'stain', bold: "unbold", space: "space-1", parent: 32, show: false, canClick: true },
    { id: 35, parameter: "Artifact", count: 0, percentage: 0, belongs_to: 'artifact', bold: "unbold", space: "space-1", parent: 32, show: false, canClick: true },
    { id: 36, parameter: "NRBC", count: 0, percentage: 0, belongs_to: 'nucleated_rbc', bold: "unbold", space: "space-1", parent: 32, show: false, canClick: true },
    { id: 37, parameter: "Giant platelets", count: 0, percentage: 0, belongs_to: 'giant_platelet', bold: "unbold", space: "space-1", parent: 32, show: false, canClick: true },
    { id: 38, parameter: "Platelet clumps", count: 0, percentage: 0, belongs_to: 'platelet_clump', bold: "unbold", space: "space-1", parent: 32, show: false, canClick: true },
    { id: 39, parameter: "Duplicates", count: 0, percentage: 0, belongs_to: 'duplicates', bold: "unbold", space: "space-1", parent: 32, show: false, canClick: true },

    { id: 40, parameter: "Total", count: 0, percentage: 100, belongs_to: 'total_classified_cells', bold: "bold", space: "", parent: -1, show: true, canClick: false },
];

export default WBC_STATIC;