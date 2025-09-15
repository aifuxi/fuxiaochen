import {
  AdminContentLayout,
  CreateSnippetForm,
  CreateSnippetPageHeader,
} from "../../components";

export const CreateSnippetPage = () => {
  return (
    <AdminContentLayout header={<CreateSnippetPageHeader />}>
      <CreateSnippetForm />
    </AdminContentLayout>
  );
};
