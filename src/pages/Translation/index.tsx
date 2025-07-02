import ArrowLeft from "@/assets/icons/arrow-left.svg?react";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { apiTranslation } from "@/services/api-client";
import { DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE } from "@/store";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TranslationHistory from "./history";
import styles from "./styles.module.scss";
import { TranslationHistoryItem, LanguageSupport } from "./type";

export default function Home() {
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_TARGET_LANGUAGE);
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [listSupportLanguage, setListSupportLanguage] = useState<
    LanguageSupport[] | []
  >([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<
    TranslationHistoryItem[]
  >([]);

  // Apply debounce to sourceText with 200ms delay
  const debouncedSourceText = useDebounce(sourceText, 200);

  useEffect(() => {
    retrieveListSupportLanguage();
    // Load translation history from localStorage when component mounts
    const storedHistory = localStorage.getItem("translationHistory");
    if (storedHistory) {
      setTranslationHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Effect to trigger translation when debounced text changes
  useEffect(() => {
    if (debouncedSourceText && sourceLanguage && targetLanguage) {
      handleTranslate();
    } else if (!debouncedSourceText) {
      setTargetText("");
    }
  }, [debouncedSourceText, sourceLanguage, targetLanguage]);

  const handleSelectItem = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(
        translationHistory.map((item: TranslationHistoryItem) => item.id),
      );
    } else {
      setSelectedItems([]);
    }
  };

  const retrieveListSupportLanguage = async () => {
    console.info("GET:: fetching languages");
    const response = await apiTranslation.get(`/languages`);
    setListSupportLanguage(response as LanguageSupport[]);
    return response;
  };

  const handleTranslate = async () => {
    if (!debouncedSourceText || isTranslating) return;

    try {
      setIsTranslating(true);
      console.info("POST:: translating");
      const response: any = await apiTranslation.post(`/translate`, {
        source_lang: sourceLanguage,
        target_lang: targetLanguage,
        text: debouncedSourceText,
      });
      setTargetText(response.translated_text);

      // Store translation in history
      const newHistoryItem: TranslationHistoryItem = {
        id: Date.now().toString(), // Generate a unique ID based on timestamp
        sourceLanguage:
          listSupportLanguage.find(
            (language: LanguageSupport) => language.language === sourceLanguage,
          )?.name || sourceLanguage,
        targetLanguage:
          listSupportLanguage.find(
            (language: LanguageSupport) => language.language === targetLanguage,
          )?.name || targetLanguage,
        sourceText: debouncedSourceText,
        translatedText: response.translated_text,
        timestamp: Date.now(),
      };

      // Update history state
      const updatedHistory = [newHistoryItem, ...translationHistory].slice(
        0,
        100,
      ); // Keep only the latest 100 items
      setTranslationHistory(updatedHistory);

      // Save to localStorage
      localStorage.setItem(
        "translationHistory",
        JSON.stringify(updatedHistory),
      );
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDeleteSelectedItems = () => {
    const updatedHistory = translationHistory.filter(
      (item: TranslationHistoryItem) => !selectedItems.includes(item.id),
    );
    setTranslationHistory(updatedHistory);
    setSelectedItems([]);
    // Save updated history to localStorage
    localStorage.setItem("translationHistory", JSON.stringify(updatedHistory));
  };

  return (
    <>
      <Link to={"/"} className={styles.backLink}>
        <ArrowLeft />
        <span>Trở lại</span>
      </Link>

      <h1 className={styles.title}>Dịch thuật</h1>
      <div className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Combobox
              options={listSupportLanguage.map((language: LanguageSupport) => ({
                value: language.language,
                label: language.name,
              }))}
              onSelect={(value) => {
                setSourceLanguage(value);
              }}
              data={sourceLanguage}
              className="w-full mb-2"
              popoverContentClassName="w-[350px]"
            />

            <Textarea
              placeholder="Nhập văn bản để dịch..."
              className="aspect-[2] resize-none"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </div>

          <div>
            <Combobox
              options={listSupportLanguage.map((language: LanguageSupport) => ({
                value: language.language,
                label: language.name,
              }))}
              onSelect={(value) => {
                setTargetLanguage(value);
              }}
              data={targetLanguage}
              className="w-full mb-2"
              popoverContentClassName="w-[350px]"
            />

            <div className="aspect-[2] bg-gray-50 rounded-md border p-4">
              {targetText}
            </div>
          </div>
        </div>
      </div>

      <TranslationHistory
        handleDeleteSelectedItems={handleDeleteSelectedItems}
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        history={translationHistory}
      />
    </>
  );
}
