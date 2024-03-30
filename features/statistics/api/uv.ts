import { useRequest } from 'ahooks';

import {
  getBlogUV,
  getSnippetUV,
  getUV,
  recordBlogUV,
  recordSnippetUV,
  recordUV,
} from '../actions';

export const useRecordUV = () => {
  return useRequest((cid: string) => recordUV(cid), { manual: true });
};

export const useGetUV = () => {
  return useRequest(() => getUV());
};

export const useRecordBlogUV = () => {
  return useRequest(
    (blogID?: string, cid?: string) => recordBlogUV(blogID, cid),
    { manual: true },
  );
};

export const useGetBlogUV = () => {
  return useRequest((blogID: string) => getBlogUV(blogID));
};

export const useRecordSnippetUV = () => {
  return useRequest(
    (snippetID?: string, cid?: string) => recordSnippetUV(snippetID, cid),
    { manual: true },
  );
};

export const useGetSnippetUV = () => {
  return useRequest((snippetID: string) => getSnippetUV(snippetID));
};
