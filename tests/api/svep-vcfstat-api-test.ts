import { PREFIX_S3_PATH, PROJECT_NAMES } from "./constants";

// processor.ts
interface Context {
  vars: Record<string, any>;
}

interface Events {
  emit: (event: string, data?: any) => void;
}

interface RequestParams {
  url: string;
  method: string;
  headers: Record<string, any>;
  json: any;
}

const KEYS = ["alle_freq", "gq", "qc_hc", "snp_pass", "low_var"];
const FILENAME = "rare_disease.vcf.gz";

type DoneCallback = () => void;

export function setVariablesForNextProject(
  requestParams: RequestParams,
  context: Context,
  ee: Events,
  next: DoneCallback
): void {
  // Get current loop iteration (0-based, Artillery provides this)
  const currentLoop = context.vars.$loopCount || 1;
  const arrayIndex = currentLoop - 1; // Convert to 0-based index
  // const projectName = PROJECT_NAMES[arrayIndex];
  const projectName = "Project-load-testing-0a98cd";

  // Set dynamic variables
  context.vars.projectName = projectName;
  context.vars.fileName = FILENAME;

  requestParams.url = `/vcfstats`;

  // Debug logs
  console.log(
    `🎯 Loop ${currentLoop}/4 [Index: ${arrayIndex}] -> Project: ${projectName}`
  );
  next();
}
