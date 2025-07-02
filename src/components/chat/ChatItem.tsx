import { Chat } from "@/pages/Chatbox/Chatbox";
import TrashIcon from "@/assets/icons/trash.svg?react";
import dayjs from "dayjs";

interface ChatItemProps {
  chat: Chat;
  handleDeleteChat: (chatId: string) => void;
}

const ChatItem = ({ chat, handleDeleteChat }: ChatItemProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    handleDeleteChat(chat.id);
  };

  return (
    <div className="flex flex-col gap-2 justify-between cursor-pointer relative w-full">
      <h3 className="text-black text-[14px] font-bold !mt-[0px]">
        {chat.tittle}
      </h3>
      <p className="text-medium text-[12px]">
        {"Tạo lúc: "}
        {dayjs(chat.date).format("HH:mm DD/MM/YYYY")}
      </p>
      <TrashIcon
        className="w-4 h-4 text-gray-500 absolute top-0 right-[-5px] "
        onClick={handleDelete}
      />
    </div>
  );
};

export default ChatItem;
