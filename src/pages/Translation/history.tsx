"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { Trash } from "lucide-react";
import { TranslationHistoryItem } from "./type";

interface TranslationHistoryProps {
  selectedItems: string[];
  onSelectItem: (id: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  history: TranslationHistoryItem[]; // Add this prop
  handleDeleteSelectedItems: () => void;
}

export default function TranslationHistory({
  handleDeleteSelectedItems,
  selectedItems,
  onSelectItem,
  onSelectAll,
  history,
}: TranslationHistoryProps) {
  const allSelected =
    selectedItems.length === history.length && history.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Lịch sử</h2>
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => onSelectAll(!!checked)}
        />
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Source Language</TableHead>
              <TableHead>Translation</TableHead>
              <TableHead>Target Language</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item: TranslationHistoryItem) => (
              <TableRow key={item.id}>
                <TableCell className="p-0 flex items-center justify-center">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) =>
                      onSelectItem(item.id, !!checked)
                    }
                  />
                </TableCell>
                <TableCell>{item.sourceText}</TableCell>
                <TableCell>{item.sourceLanguage}</TableCell>
                <TableCell>{item.translatedText}</TableCell>
                <TableCell>{item.targetLanguage}</TableCell>
                <TableCell>
                  {dayjs(item.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                </TableCell>
              </TableRow>
            ))}
            {!history ||
              (history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No history found
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex gap-1 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteSelectedItems}
          className={cn(
            "flex items-center text-red-400 border-red-400 hover:text-red-500 hover:border-red-500",
            selectedItems.length === 0 ? "opacity-0 invisible" : "",
          )}
        >
          <Trash className=" h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
