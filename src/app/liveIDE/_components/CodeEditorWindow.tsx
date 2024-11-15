"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorWindowProps {
  onChange: (key: string, value: string) => void;
  language?: string;
  code?: string;
  theme?: string;
}

const CodeEditorWindow = forwardRef<
  { updateCode: (code: string) => void },
  CodeEditorWindowProps
>(
  (
    { onChange, language = "javascript", code = "", theme = "vs-dark" },
    ref
  ) => {
    const [value, setValue] = useState<string>(code);

    useEffect(() => {
      setValue(code);
    }, [code]);

    const handleEditorChange = (value: string | undefined) => {
      setValue(value || "");
      onChange("code", value || "");
    };

    useImperativeHandle(ref, () => ({
      updateCode: (newCode: string) => {
        setValue(newCode);
      },
    }));

    return (
      <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl">
        <Editor
          height="85vh"
          width="100%"
          language={language}
          value={value}
          theme={theme}
          onChange={handleEditorChange}
        />
      </div>
    );
  }
);

CodeEditorWindow.displayName = "CodeEditorWindow";

export default CodeEditorWindow;
