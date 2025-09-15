import {
  AdminContentLayout,
  EditBlogForm,
  EditBlogPageHeader,
} from "../../components";

export const EditBlogPage = () => {
  return (
    <AdminContentLayout header={<EditBlogPageHeader />}>
      <EditBlogForm />
    </AdminContentLayout>
  );
};
