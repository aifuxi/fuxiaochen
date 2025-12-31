import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/components/main-layout";
import Login from "@/routes/login";
import Index from "@/routes";
import Category from "@/routes/category";
import Tag from "@/routes/tag";
import User from "@/routes/user";
import NiceModal from "@ebay/nice-modal-react";
import BlogList from "@/routes/blog/blog-list";
import BlogCreate from "@/routes/blog/blog-create";
import { ROUTES } from "@/constants/route";
import ProtectRoute from "./components/protect-route";
import { PERMISSION_CODES } from "./constants/permission-codes";

const router = createBrowserRouter([
  {
    path: ROUTES.Login.href,
    Component: Login,
  },
  {
    path: ROUTES.Home.href,
    element: (
      <NiceModal.Provider>
        <MainLayout />
      </NiceModal.Provider>
    ),
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: ROUTES.Category.href,
        element: (
          <ProtectRoute
            requireSomePermissionCodes={[
              PERMISSION_CODES.PermissionCategoryList,
            ]}
          >
            <Category />
          </ProtectRoute>
        ),
      },
      {
        path: ROUTES.Tag.href,
        element: (
          <ProtectRoute
            requireSomePermissionCodes={[PERMISSION_CODES.PermissionTagList]}
          >
            <Tag />
          </ProtectRoute>
        ),
      },
      {
        path: ROUTES.User.href,
        element: (
          <ProtectRoute
            requireAllPermissionCodes={[PERMISSION_CODES.PermissionAdminAll]}
          >
            <User />
          </ProtectRoute>
        ),
      },
      {
        path: ROUTES.BlogList.href,
        element: (
          <ProtectRoute
            requireSomePermissionCodes={[PERMISSION_CODES.PermissionBlogList]}
          >
            <BlogList />
          </ProtectRoute>
        ),
      },
      {
        path: ROUTES.BlogCreate.href,
        element: (
          <ProtectRoute
            requireSomePermissionCodes={[
              PERMISSION_CODES.PermissionBlogCreate,
              PERMISSION_CODES.PermissionBlogUpdate,
              PERMISSION_CODES.PermissionBlogList,
              PERMISSION_CODES.PermissionBlogView,
            ]}
          >
            <BlogCreate />
          </ProtectRoute>
        ),
      },
    ],
  },
]);

export default router;
