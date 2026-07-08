import React from "react";

// Simple in-memory store for IDE state
const createStore = () => {
  let listeners = [];
  let state = {
    settings: {
      provider: "openrouter",
      apiKey: "",
      model: "openai/gpt-4o-mini",
      outputFolder: "generated-project",
    },
    files: {},
    activeFile: null,
    isGenerating: false,
    currentStreamingFile: null,
    logs: [],
    abortController: null,
    github: { token: "" },
    directoryHandle: null,
    folderName: null,
  };

  const getState = () => state;

  const setState = (updater) => {
    state = typeof updater === "function" ? updater(state) : { ...state, ...updater };
    listeners.forEach((l) => l(state));
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  };

  return { getState, setState, subscribe };
};

export const ideStore = createStore();

export const useIdeStore = () => {
  const [state, setState] = React.useState(ideStore.getState());
  React.useEffect(() => ideStore.subscribe(setState), []);
  return state;
};