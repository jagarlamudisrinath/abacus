export interface PracticeSheet {
  id: string;
  name: string;
  questions: { expression: string; answer: number }[];
}

// Static practice sheets removed - all data now comes from database
export const PRACTICE_SHEETS: PracticeSheet[] = [];

export function getPracticeSheetById(id: string): PracticeSheet | undefined {
  return PRACTICE_SHEETS.find(sheet => sheet.id === id);
}

export function getAllPracticeSheets(): { id: string; name: string; questionCount: number }[] {
  return PRACTICE_SHEETS.map(sheet => ({
    id: sheet.id,
    name: sheet.name,
    questionCount: sheet.questions.length
  }));
}
