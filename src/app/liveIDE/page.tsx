"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import monacoThemes from "monaco-themes/themes/themelist.json";
import CodeEditorWindow from "./_components/CodeEditorWindow";
import CustomInput from "./_components/CustomInput";
import OutputWindow from "./_components/OutputWindow";
import ThemeDropdown from "./_components/ThemeDropdown";
import { languageOptions } from "./_constants/languageOptions";
import { defineTheme } from "./_lib/defineTheme";
import { OutputDetails as OutputDetailsType } from "./_types/outputTypes";
import { redirect } from "next/navigation";

interface LanguageOption {
  id: number;
  label: string;
  name: string;
  value: string;
}

interface ThemeOption {
  label: string;
  value: string;
  key: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  isOnline: boolean;
  avatarUrl?: string;
  googleId?: string;
}

const javascriptDefault = "//Code here";

export default function LiveIDE() {
  const { toast } = useToast();
  const [code, setCode] = useState<string>("//Code here");
  // const [code, setCode] = useState<string>(javascriptDefault);
  const [originalCode, setOriginalCode] = useState<string>(javascriptDefault);
  const [collaboratorCode, setCollaboratorCode] = useState<string>("");
  const [customInput, setCustomInput] = useState<string>("");
  const [language, setLanguage] = useState<LanguageOption>(languageOptions[0]);
  const [theme, setTheme] = useState<ThemeOption>({
    label: "Cobalt",
    value: "cobalt",
    key: "cobalt",
  });
  const [outputDetails, setOutputDetails] = useState<
    OutputDetailsType | undefined
  >(undefined);
  const [processing, setProcessing] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showHelpDialog, setShowHelpDialog] = useState<boolean>(false);
  const [helpRequest, setHelpRequest] = useState<{
    student: string;
    teacher: string;
  } | null>(null);
  const [inRoom, setInRoom] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codeEditorRef = useRef<any>(null);

  if (!session?.user) redirect("/login");

  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      query: { username: session?.user?.name },
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      newSocket.emit("getUsers");
    });

    newSocket.on("userList", (userList: User[]) => {
      console.log("Received userList from socket:", userList);
      if (Array.isArray(userList)) {
        setUsers(removeDuplicateUsers(userList));
      } else {
        console.error("Received invalid userList:", userList);
      }
    });

    newSocket.on("userConnected", (user: User) => {
      console.log("User connected:", user);
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((u) =>
          u._id === user._id ? { ...u, isOnline: true } : u
        );
        return removeDuplicateUsers([...updatedUsers, user]);
      });
    });

    newSocket.on("userDisconnected", (userId: string) => {
      console.log("User disconnected:", userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isOnline: false } : user
        )
      );
    });

    newSocket.on("helpRequest", ({ student, teacher, studentCode }) => {
      setHelpRequest({ student, teacher });
      setCollaboratorCode(studentCode);
      setOriginalCode(code);
      setCode(studentCode);
      setShowHelpDialog(true);
      // console.log(
      //   `CODE: ${code} \nOG CODE: ${originalCode}\nCOLLA code:${collaboratorCode} \nSTUD code: ${studentCode}`
      // );
    });

    newSocket.on(
      "helpResponseReceived",
      ({ teacher, accepted, teacherCode }) => {
        if (accepted) {
          toast({
            title: "Help Request Accepted",
            description: `${teacher} has accepted your help request.`,
          });
          setCollaboratorCode(teacherCode);
        } else {
          toast({
            title: "Help Request Declined",
            description: `${teacher} has declined your help request.`,
            variant: "destructive",
          });
        }
      }
    );

    newSocket.on("joinRoom", (newRoomId: string, collaboratorCode: string) => {
      setInRoom(true);
      setRoomId(newRoomId);
      setOriginalCode(code);
      setCode(collaboratorCode);
      toast({
        title: "Joined Collaboration Room",
        description: `You have joined room ${newRoomId}`,
      });
    });

    newSocket.on("codeUpdated", (updatedCode: string) => {
      setCode(updatedCode);
    });

    newSocket.on("userLeftRoom", (username: string) => {
      toast({
        title: "User Left Room",
        description: `${username} has left the collaboration room.`,
        variant: "destructive",
      });
      setInRoom(false);
      setRoomId(null);
      setCode(originalCode);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const removeDuplicateUsers = (userList: User[]): User[] => {
    const uniqueUsers = new Map();
    userList.forEach((user) => {
      if (!uniqueUsers.has(user._id)) {
        uniqueUsers.set(user._id, user);
      }
    });
    return Array.from(uniqueUsers.values());
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      console.log("Fetched users from API:", response.data);
      if (Array.isArray(response.data)) {
        setUsers(removeDuplicateUsers(response.data));
      } else {
        console.error("Unexpected response format:", response.data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const handleLanguageChange = (value: string) => {
    const selectedLanguage = languageOptions.find(
      (lang) => lang.id.toString() === value
    );
    if (selectedLanguage) setLanguage(selectedLanguage);
  };

  const handleThemeChange = (themeId: string) => {
    const themeName = monacoThemes[themeId as keyof typeof monacoThemes];
    const newTheme = { label: themeName, value: themeId, key: themeId };
    if (["light", "vs-dark"].includes(themeId)) {
      setTheme(newTheme);
    } else {
      defineTheme(themeId).then(() => setTheme(newTheme));
    }
  };

  const onChange = (action: string, data: string) => {
    if (action === "code") {
      setCode(data);
      if (inRoom && socket && roomId) {
        socket.emit("updateCode", { roomId, code: data });
      }
    }
  };

  const handleCompile = async () => {
    setProcessing(true);
    const formData = {
      language_id: language.id,
      source_code: btoa(code),
      stdin: btoa(customInput),
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_RAPID_API_URL}/submissions`,
        formData,
        {
          params: { base64_encoded: "true", fields: "*" },
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Host": process.env.NEXT_PUBLIC_RAPID_API_HOST,
            "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPID_API_KEY,
          },
        }
      );

      const { token } = response.data;
      await checkStatus(token);
    } catch (err) {
      console.error("Compilation error:", err);
      setProcessing(false);
    }
  };

  const checkStatus = async (token: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_RAPID_API_URL}/submissions/${token}`,
        {
          params: { base64_encoded: "true", fields: "*" },
          headers: {
            "X-RapidAPI-Host": process.env.NEXT_PUBLIC_RAPID_API_HOST,
            "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPID_API_KEY,
          },
        }
      );

      const { status, memory, time, stdout, stderr, compile_output } =
        response.data;
      if (status.id === 1 || status.id === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
      } else {
        setProcessing(false);
        setOutputDetails({
          status,
          memory,
          time,
          stdout,
          stderr,
          compile_output,
        });
      }
    } catch (err) {
      console.error("Status check error:", err);
      setProcessing(false);
    }
  };

  const handleAskHelp = useCallback(() => {
    if (selectedUser && socket && session?.user?.name) {
      socket.emit("askHelp", {
        student: session.user.name,
        teacher: selectedUser.name,
        studentCode: code,
      });
      toast({
        title: "Help Request Sent",
        description: `Your help request has been sent to ${selectedUser.name}.`,
      });
      setCooldown(15);
    }
  }, [selectedUser, socket, session, code]);

  const handleHelpResponse = useCallback(
    (accepted: boolean) => {
      if (helpRequest && socket) {
        socket.emit("helpResponse", {
          student: helpRequest.student,
          teacher: helpRequest.teacher,
          accepted,
          teacherCode: code,
        });
        setShowHelpDialog(false);
        setHelpRequest(null);
        if (accepted) {
          setOriginalCode(code);
          setCode(collaboratorCode);
          toast({
            title: "Help Request Accepted",
            description: `You have accepted the help request from ${helpRequest.student}.`,
          });
        }
      }
    },
    [helpRequest, socket, code, collaboratorCode]
  );

  const handleLeaveRoom = useCallback(() => {
    if (socket && roomId) {
      socket.emit("leaveRoom", roomId);
      setInRoom(false);
      setRoomId(null);
      setCode(originalCode);
      toast({
        title: "Left Collaboration Room",
        description: "You have left the collaboration room.",
      });
    }
  }, [socket, roomId, originalCode]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col sm:flex-row justify-between p-4">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-2 sm:mb-0">
          <Select onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((lang) => (
                <SelectItem key={lang.id} value={lang.id.toString()}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
        </div>
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={(value) => {
              const user = users.find((u) => u._id === value);
              setSelectedUser(user || null);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select user..." />
            </SelectTrigger>
            <SelectContent>
              {users.length > 0 ? (
                users
                  .filter((user) => user._id !== session?.user?.id)
                  .map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            user.isOnline ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                      </div>
                    </SelectItem>
                  ))
              ) : (
                <SelectItem value="no-users" disabled>
                  No users available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleAskHelp}
            disabled={!selectedUser || inRoom || cooldown > 0}
          >
            {cooldown > 0 ? `Wait ${cooldown}s` : "Ask Help"}
          </Button>
          {inRoom && (
            <Button variant="destructive" onClick={handleLeaveRoom}>
              End Session
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-grow overflow-hidden">
        <div className="w-full sm:w-[70%] h-1/2 sm:h-full">
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language.value}
            theme={theme.value}
            ref={codeEditorRef}
          />
        </div>
        <div className="w-full sm:w-[30%] h-1/2 sm:h-full overflow-auto p-4">
          <OutputWindow outputDetails={outputDetails} />
          <div className="mt-4">
            <CustomInput
              customInput={customInput}
              setCustomInput={setCustomInput}
            />
            <Button
              onClick={handleCompile}
              disabled={!code || processing}
              className="w-full mt-2"
            >
              {processing ? "Processing..." : "Compile and Execute"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help Request</DialogTitle>
            <DialogDescription>
              {helpRequest &&
                `${helpRequest.student} is asking for help/collaboration.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => handleHelpResponse(false)}>
              Decline
            </Button>
            <Button onClick={() => handleHelpResponse(true)}>Accept</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
