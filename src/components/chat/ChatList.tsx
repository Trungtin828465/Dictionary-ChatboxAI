import styles from "./styles.module.scss";
import ChatItem from "./ChatItem";
import { Card } from "../ui/card";
import { Chat } from "@/pages/Chatbox/Chatbox";
interface listChatsProps {
  listChats: Chat[];
  selectedChat?: string;
  handleSelectChat: (chatId: string) => void;
  handleDeleteChat: (chatId: string) => void;
}

const ChatList = ({
  listChats,
  selectedChat,
  handleSelectChat,
  handleDeleteChat,
}: listChatsProps) => {
  return (
    <div className={styles.ChatList}>
      {listChats.map((chat) => (
        <Card
          key={chat.id}
          className={`${styles.ChatItem} ${
            selectedChat ? (selectedChat === chat.id ? styles.active : "") : ""
          }`}
          onClick={() => handleSelectChat(chat.id)}
        >
          <ChatItem chat={chat} handleDeleteChat={handleDeleteChat}></ChatItem>
        </Card>
      ))}
    </div>
  );
};

export default ChatList;
