import {
  AdminContentLayout,
  EditSnippetForm,
  EditSnippetPageHeader,
} from "../../components";

export const EditSnippetPage = () => {
  return (
    <AdminContentLayout header={<EditSnippetPageHeader />}>
      <EditSnippetForm />
    </AdminContentLayout>
  );
};
