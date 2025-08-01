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

type DoneCallback = () => void;

const PROJECTS = ["Project-load-testing-85e130"];

const SCOPE = {
  individuals: "individuals",
  biosamples: "biosamples",
  runs: "runs",
};

const SCOPES = [SCOPE.individuals, SCOPE.biosamples, SCOPE.runs];

const SCOPE_PARAMS = {
  [SCOPE.individuals]: {
    projects: PROJECTS,
    query: {
      filters: [],
      requestedGranularity: "count",
      pagination: {},
    },
    meta: {
      apiVersion: "v2.0",
    },
  },
  [SCOPE.biosamples]: {
    projects: PROJECTS,
    query: {
      filters: [],
      requestedGranularity: "count",
      pagination: {},
    },
    meta: {
      apiVersion: "v2.0",
    },
  },
  [SCOPE.runs]: {
    projects: ["Project-load-testing-85e130"],
    query: {
      filters: [],
      requestedGranularity: "count",
      pagination: {},
    },
    meta: {
      apiVersion: "v2.0",
    },
  },
};

export function setVariablesForNextProject(
  requestParams: RequestParams,
  context: Context,
  ee: Events,
  next: DoneCallback
): void {
  const totalLoops = SCOPES.length;
  const currentLoop = context.vars.$loopCount || 1;
  const arrayIndex = currentLoop - 1;

  const scope = SCOPE_PARAMS[SCOPES[arrayIndex]];

  requestParams.url = `/${SCOPES[arrayIndex]}`;

  context.vars.totalLoops = totalLoops;
  context.vars.meta = scope.meta;
  context.vars.projects = scope.projects;
  context.vars.query = scope.query;
  context.vars.scope = SCOPES[arrayIndex];

  next();
}
