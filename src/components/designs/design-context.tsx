"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import {
  CanvasElement,
  DesignResponse,
} from "@/lib/design-studio/types/design-studio.types";
import { UpdateDesignDto } from "@/lib/design-studio/dto/design-studio.dto";
import { useUpdateDesign } from "@/hooks/use-design-studio";
import { toast } from "sonner";

interface DesignState {
  canvasId: string;
  design: DesignResponse | null;
  elements: CanvasElement[];
  selectedElement: CanvasElement | null;
  canvasSettings: {
    width: number;
    height: number;
    backgroundColor: string;
    zoom: number;
    showGrid: boolean;
    showSafeZone: boolean;
    showBleed: boolean;
  };
  isPreviewMode: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  history: {
    past: CanvasElement[][];
    future: CanvasElement[][];
  };
}

type DesignAction =
  | { type: "SET_CANVAS_ID"; payload: string }
  | { type: "SET_DESIGN"; payload: DesignResponse }
  | { type: "ADD_ELEMENT"; payload: CanvasElement }
  | {
      type: "UPDATE_ELEMENT";
      payload: { id: string; updates: Partial<CanvasElement> };
    }
  | { type: "DELETE_ELEMENT"; payload: string }
  | { type: "SELECT_ELEMENT"; payload: CanvasElement | null }
  | { type: "SET_ELEMENTS"; payload: CanvasElement[] }
  | {
      type: "UPDATE_CANVAS_SETTINGS";
      payload: Partial<DesignState["canvasSettings"]>;
    }
  | { type: "SET_PREVIEW_MODE"; payload: boolean }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "MARK_SAVED" }
  | { type: "MARK_DIRTY" };

const initialState: DesignState = {
  canvasId: "",
  design: null,
  elements: [],
  selectedElement: null,
  canvasSettings: {
    width: 190, // 190mm
    height: 15, // 15mm
    backgroundColor: "#ffffff",
    zoom: 1,
    showGrid: true,
    showSafeZone: true,
    showBleed: true,
  },
  isPreviewMode: false,
  isDirty: false,
  lastSaved: null,
  history: {
    past: [],
    future: [],
  },
};

function designReducer(state: DesignState, action: DesignAction): DesignState {
  switch (action.type) {
    case "SET_CANVAS_ID":
      return { ...state, canvasId: action.payload };

    case "SET_DESIGN":
      return {
        ...state,
        design: action.payload,
        elements: action.payload.customizations.elements || [],
        canvasSettings: {
          ...state.canvasSettings,
          width:
            action.payload.customizations.width || state.canvasSettings.width,
          height:
            action.payload.customizations.height || state.canvasSettings.height,
          backgroundColor:
            action.payload.customizations.backgroundColor ||
            state.canvasSettings.backgroundColor,
        },
        isDirty: false,
        lastSaved: new Date(),
      };

    case "ADD_ELEMENT":
      return {
        ...state,
        elements: [...state.elements, action.payload],
        selectedElement: action.payload,
        isDirty: true,
        history: {
          past: [...state.history.past, state.elements],
          future: [],
        },
      };

    case "UPDATE_ELEMENT":
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.payload.id
            ? { ...el, ...action.payload.updates }
            : el
        ),
        selectedElement:
          state.selectedElement?.id === action.payload.id
            ? { ...state.selectedElement, ...action.payload.updates }
            : state.selectedElement,
        isDirty: true,
      };

    case "DELETE_ELEMENT":
      return {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.payload),
        selectedElement:
          state.selectedElement?.id === action.payload
            ? null
            : state.selectedElement,
        isDirty: true,
        history: {
          past: [...state.history.past, state.elements],
          future: [],
        },
      };

    case "SELECT_ELEMENT":
      return { ...state, selectedElement: action.payload };

    case "SET_ELEMENTS":
      return {
        ...state,
        elements: action.payload,
        isDirty: true,
        history: {
          past: [...state.history.past, state.elements],
          future: [],
        },
      };

    case "UPDATE_CANVAS_SETTINGS":
      return {
        ...state,
        canvasSettings: { ...state.canvasSettings, ...action.payload },
        isDirty: true,
      };

    case "SET_PREVIEW_MODE":
      return { ...state, isPreviewMode: action.payload };

    case "UNDO":
      if (state.history.past.length === 0) return state;
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      return {
        ...state,
        elements: previous,
        selectedElement: null,
        history: {
          past: newPast,
          future: [state.elements, ...state.history.future],
        },
        isDirty: true,
      };

    case "REDO":
      if (state.history.future.length === 0) return state;
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      return {
        ...state,
        elements: next,
        selectedElement: null,
        history: {
          past: [...state.history.past, state.elements],
          future: newFuture,
        },
        isDirty: true,
      };

    case "MARK_SAVED":
      return { ...state, isDirty: false, lastSaved: new Date() };

    case "MARK_DIRTY":
      return { ...state, isDirty: true };

    default:
      return state;
  }
}

interface DesignContextType extends DesignState {
  dispatch: React.Dispatch<DesignAction>;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (element: CanvasElement | null) => void;
  updateCanvasSettings: (
    settings: Partial<DesignState["canvasSettings"]>
  ) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const DesignContext = createContext<DesignContextType | null>(null);

interface DesignProviderProps {
  children: React.ReactNode;
  designId?: string;
  autoSaveInterval?: number;
}

export function DesignProvider({
  children,
  designId,
  autoSaveInterval = 10000, // 10 seconds
}: DesignProviderProps) {
  const [state, dispatch] = useReducer(designReducer, initialState);
  const updateDesign = useUpdateDesign();

  // Auto-save functionality
  useEffect(() => {
    if (!state.isDirty || !state.design || !designId) return;

    const saveTimer = setTimeout(() => {
      const updateData: UpdateDesignDto = {
        customizations: {
          ...state.canvasSettings,
          elements: state.elements,
        },
      };

      updateDesign.mutate(
        { designId, values: updateData },
        {
          onSuccess: () => {
            dispatch({ type: "MARK_SAVED" });
            toast.success("Design auto-saved", { duration: 2000 });
          },
          onError: (error) => {
            console.error("Auto-save failed:", error);
            toast.error("Auto-save failed");
          },
        }
      );
    }, autoSaveInterval);

    return () => clearTimeout(saveTimer);
  }, [
    state.isDirty,
    state.elements,
    state.canvasSettings,
    state.design,
    designId,
    autoSaveInterval,
    updateDesign,
  ]);

  const addElement = useCallback((element: CanvasElement) => {
    dispatch({ type: "ADD_ELEMENT", payload: element });
  }, []);

  const updateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      dispatch({ type: "UPDATE_ELEMENT", payload: { id, updates } });
    },
    []
  );

  const deleteElement = useCallback((id: string) => {
    dispatch({ type: "DELETE_ELEMENT", payload: id });
  }, []);

  const selectElement = useCallback((element: CanvasElement | null) => {
    dispatch({ type: "SELECT_ELEMENT", payload: element });
  }, []);

  const updateCanvasSettings = useCallback(
    (settings: Partial<DesignState["canvasSettings"]>) => {
      dispatch({ type: "UPDATE_CANVAS_SETTINGS", payload: settings });
    },
    []
  );

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const contextValue: DesignContextType = {
    ...state,
    dispatch,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    updateCanvasSettings,
    undo,
    redo,
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
  };

  return (
    <DesignContext.Provider value={contextValue}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesignContext() {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error("useDesignContext must be used within a DesignProvider");
  }
  return context;
}
