import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";

interface DetailResultTabProps {
  title: string;
  icon: React.ReactNode;
  content?: any;
}

const DetailResultTab = ({ title, icon, content }: DetailResultTabProps) => {
  return (
    <div className="cursor-pointer ml-[2px] mr-[2px] w-[99%] overflow-auto shadow-[0_0_2px_0_rgba(123,138,131,0.4)]">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="flex text-[14px] font-bold flex-row gap-2 items-center">
            {icon}
            <p>{title}</p>
          </AccordionTrigger>
          <AccordionContent>
            {content ? (
              content
            ) : (
              <p className="text-[14px] text-center">Không có nội dung</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DetailResultTab;
