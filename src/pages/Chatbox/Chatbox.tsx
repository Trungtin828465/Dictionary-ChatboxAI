import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ChatIcon from "@/assets/icons/chatbox.svg?react";
import AddIcon from "@/assets/icons/add.svg?react";
import StopIcon from "@/assets/icons/stopChat.svg?react";
import SendIcon from "@/assets/icons/sendIcon.svg?react";
import ReactMarkdown from "react-markdown";
import styles from "./styles.module.scss";
import { useEffect, useRef, useState } from "react";
import ChatList from "@/components/chat/ChatList";
import { SpinnerAnswering } from "@/components/Spinner";
import { useAuth } from "@/contexts/auth-context";
import NonSupportedFeature from "../NonSupportedFeature";
import { api, api_version } from "@/services/api-client";
interface DetailChat {
  id?: string;
  content: string;
  createdAt?: string;
  chatId?: string;
  userId?: string;
  role: "user" | "ai";
}

export interface Chat {
  id: string;
  tittle: string;
  date: string;
}

export function Chatbox() {
  const { user } = useAuth();

  const [listChats, setListChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | undefined>();
  const [detailChat, setDetailChat] = useState<DetailChat[]>([]);

  const [typing, setTyping] = useState<string>("");
  const [isOpenNewChat, setIsOpenNewChat] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    fetchChatsData();
    if (!listChats) {
      setIsOpenNewChat(true);
    }
  }, [user]);

  const fetchChatsData = async () => {
    if (!user?.id) return;
    try {
      const response: any[] = await api.get(`/${api_version}/Chat/${user?.id}`);
      const listChat: Chat[] = response?.map((item: any) => ({
        id: item.id,
        tittle: item.title,
        date: item.createdAt,
      }));
      setListChats(listChat);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Only update if the last character isn't a newline
    if (!value.endsWith("\n")) {
      setTyping(value);
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await api.delete(`/${api_version}/Chat/${chatId}`);
      await fetchChatsData();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddChat = async () => {
    if (!isOpenNewChat) {
      setDetailChat([]);
      setIsOpenNewChat(true);
      setSelectedChat("");
    }
  };

  const getDetailChatByChatId = async (chatId: string) => {
    try {
      const response: any[] = await api.get(
        `/${api_version}/Chat/detail/${chatId}`,
      );
      setDetailChat((_: any[]) => response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    setSelectedChat(chatId);
    setIsOpenNewChat(false);

    // Gọi api lấy detailChatByChatId
    await getDetailChatByChatId(chatId);
  };

  const handleSendAPIChat = async (request: any) => {
    setProcessing(true);
    setLoading(true);

    try {
      const response: any = await api.post(
        `/${api_version}/Chat/request`,
        request,
      );

      await fetchChatsData();
      handleSelectChat(response.chatId);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
    setProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!processing && typing.trim()) {
        handleSend();
      }
    }
  };

  const handleSend = async () => {
    if (!typing.trim()) return;
    setIsOpenNewChat(false);

    // Tao mot cau hoi moi
    const newRequest: DetailChat = {
      role: "user",
      content: typing,
      userId: user?.id,
    };
    if (selectedChat) {
      newRequest.chatId = selectedChat;
    }

    //Thêm newRequest vào DetailChat và reset trạng thái của input
    setDetailChat((preDetailChat) => [...preDetailChat, newRequest]);
    setTyping("");
    if (inputRef.current) {
      inputRef.current.style.height = "30px";
    }

    // TODO: Add AI response logic here
    handleSendAPIChat(newRequest);
  };

  return (
    <>
      {user ? (
        <div className={styles.Chatbox}>
          <div className="h-full max-h-[82dvh]">
            <Card className={styles.ChatboxLeft}>
              <CardHeader className={styles.ChatboxHeader}>
                <div className={styles.ChatboxTitle}>
                  <ChatIcon className="w-4 h-4" />
                  <p className="text-black font-bold !mt-[0px]">MyVocab Chat</p>
                </div>
                <AddIcon
                  className="w-4 h-4 !mt-[0px] cursor-pointer"
                  onClick={handleAddChat}
                />
              </CardHeader>
              <CardContent className={styles.ChatboxLeftContent}>
                {isOpenNewChat ? (
                  <Card className="flex flex-row  p-3 cursor-pointer mb-4 border border-black">
                    <div className="flex flex-col gap-2 justify-between cursor-pointer">
                      <h3 className="text-black text-[14px] font-bold !mt-[0px]">
                        Đoạn chat mới
                      </h3>
                      <p className="text-medium text-[12px]">...</p>
                    </div>
                  </Card>
                ) : null}
                <ChatList
                  listChats={listChats}
                  selectedChat={selectedChat}
                  handleSelectChat={handleSelectChat}
                  handleDeleteChat={handleDeleteChat}
                ></ChatList>
              </CardContent>
            </Card>
          </div>
          <div className="h-full max-h-[82dvh]">
            <Card className={styles.ChatboxFrame}>
              <div className={styles.ChatboxChat}>
                {detailChat.length === 0 ? (
                  <div className="justify-center items-center flex h-full">
                    <div className={styles.ChatboxEmpty}>
                      <h2 className="text-[30px] font-extrabold text-black">
                        MyVocab Chat
                      </h2>
                      <p className="text-[14px] text-[#37474F]">
                        Bắt đầu trò chuyện với MyVocab Chat.
                      </p>
                      <p className="text-[14px] text-[#37474F]">
                        Hãy thử bắt đầu cuộc trò chuyện... Bạn muốn học gì hôm
                        nay?
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1">
                    {detailChat.map((detail) => (
                      <div
                        key={detail.id}
                        className={`flex ${
                          detail.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-fit p-3 rounded-lg leading-[2] text-sm font-normal ${
                            detail.role === "user"
                              ? "bg-secondary/50 text-black "
                              : "bg-gray-100"
                          }`}
                        >
                          <ReactMarkdown
                            components={{
                              pre: ({ children }) => (
                                <pre className="bg-gray-900 text-white p-4 rounded-lg mb-6 overflow-x-auto">
                                  {children}
                                </pre>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-outside">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="ml-4">{children}</li>
                              ),
                            }}
                          >
                            {detail.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {loading ? (
                      <div className={`flex ${"justify-start"}`}>
                        <div className={`max-w-[70%] pl-5 rounded-lg`}>
                          <SpinnerAnswering />
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              <div className={styles.ChatboxSend}>
                <div className={styles.ChatboxBar}>
                  <textarea
                    ref={inputRef}
                    value={typing}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={processing}
                    placeholder={
                      processing
                        ? "Đang gửi..."
                        : "Nhập nội dung chat tại đây..."
                    }
                    className="flex-1 resize-none overflow-scroll"
                    rows={1} // Start small
                    style={{ minHeight: "30px", maxHeight: "150px" }} // Auto-expand but keep limits
                  />
                </div>
                <div className={styles.ChatboxSendIcon}>
                  <p className="text-[12px] text-[#37474F]">
                    {" "}
                    {typing.length}/2500 từ
                  </p>
                  {processing ? (
                    <StopIcon></StopIcon>
                  ) : (
                    <div onClick={handleSend}>
                      <SendIcon></SendIcon>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <NonSupportedFeature />
      )}
    </>
  );
}
