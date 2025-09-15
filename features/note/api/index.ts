"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { request } from "@/lib/request";

import {
  type CreateNoteData,
  type CreateNoteRequest,
  type GetNoteData,
  type GetNotesData,
  type GetNotesRequest,
  type UpdateNoteData,
  type UpdateNoteRequest,
} from "../types";

export function getNotes(params: GetNotesRequest) {
  return request.get<unknown, GetNotesData>("/notes", { params });
}

export function createNote(params: CreateNoteRequest) {
  return request.post<unknown, CreateNoteData>("/notes", params);
}

export function getNote(id: string) {
  return request.get<unknown, GetNoteData>(`/note/${id}`);
}

export function deleteNote(id: string) {
  return request.delete<unknown, void>(`/note/${id}`);
}

export function updateNote(params: UpdateNoteRequest) {
  return request.put<unknown, UpdateNoteData>(`/note/${params.id}`, params);
}

export function toggleNotePublish(id: string) {
  return request.patch<unknown, UpdateNoteData>(`/note/${id}/published`);
}

export function useGetNotes(params: GetNotesRequest) {
  return useSWR(["/notes", params], () => getNotes(params));
}

export function useCreateNote() {
  return useSWRMutation<CreateNoteData, Error, string, CreateNoteRequest>(
    "/notes",
    (_, { arg }) => createNote(arg),
  );
}

export function useGetNote(id: string, opts?: { enable?: boolean }) {
  const { enable = true } = opts ?? {};
  return useSWR(enable ? ["/note", id] : null, () => getNote(id));
}

export function useDeleteNote(id: string) {
  return useSWRMutation(`/note/${id}`, () => deleteNote(id));
}

export function useUpdateNote() {
  return useSWRMutation<UpdateNoteData, Error, string, UpdateNoteRequest>(
    "/note",
    (_, { arg }) => updateNote(arg),
  );
}

export function useToggleNotePublish(id: string) {
  return useSWRMutation<UpdateNoteData, Error, string>(
    `/note/${id}/published`,
    () => toggleNotePublish(id),
  );
}
