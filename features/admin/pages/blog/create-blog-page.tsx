import {
  AdminContentLayout,
  CreateBlogForm,
  CreateBlogPageHeader,
} from "../../components";

export const CreateBlogPage = () => {
  return (
    <AdminContentLayout header={<CreateBlogPageHeader />}>
      <CreateBlogForm />
    </AdminContentLayout>
  );
};
