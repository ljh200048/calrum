import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Report, ReportStatus, ReportTargetType } from '../types';

export const createReport = async (
  reporterId: string,
  reporterEmail: string | undefined,
  targetType: ReportTargetType,
  targetId: string,
  targetTitle: string | undefined,
  reason: string,
  detail?: string
): Promise<Report> => {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newReport: Report = {
    id: reportId,
    reporterId,
    reporterEmail,
    targetType,
    targetId,
    targetTitle,
    reason,
    detail,
    status: 'pending',
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'reports', reportId), newReport);
  return newReport;
};

export const getReports = async (): Promise<Report[]> => {
  try {
    const snap = await getDocs(collection(db, 'reports'));
    const reports: Report[] = [];
    snap.forEach((d) => {
      reports.push({ id: d.id, ...(d.data() as Omit<Report, 'id'>) });
    });
    reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
};

export const updateReportStatus = async (reportId: string, status: ReportStatus): Promise<void> => {
  const reportRef = doc(db, 'reports', reportId);
  await updateDoc(reportRef, { status });
};
