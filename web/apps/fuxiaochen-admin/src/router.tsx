import { createBrowserRouter } from "react-router-dom";

import NiceModal from "@ebay/nice-modal-react";

import MainLayout from "@/components/main-layout";

import BlogCreate from "@/routes/blog/blog-create";
import BlogList from "@/routes/blog/blog-list";
import Category from "@/routes/category";
import Changelog from "@/routes/changelog";
import Login from "@/routes/login";
import Tag from "@/routes/tag";
import User from "@/routes/user";

import { ROUTES } from "@/constants/route";
import Index from "@/routes";

import ProtectRoute from "./components/protect-route";

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
          <ProtectRoute>
            <Category />
          </ProtectRoute>
        ),
      },
      {
        path: ROUTES.Tag.href,
        element: (
          <ProtectRoute>
            <Tag />
          </ProtectRoute>
        ),
      },
      {
        path: ROUTES.Changelog.href,
        element: (
          <ProtectRoute>
            <Changelog />
          </ProtectRoute>
        ),
      },
      {
        path: ROUTES.User.href,
        element: (
          <ProtectRoute requireAdmin>
            <User />
          </ProtectRoute>
        ),
      },
      {
        path: ROUTES.BlogList.href,
        element: (
          <ProtectRoute>
            <BlogList />
          </ProtectRoute>
        ),
      },
      {
        path: ROUTES.BlogCreate.href,
        element: (
          <ProtectRoute>
            <BlogCreate />
          </ProtectRoute>
        ),
      },
    ],
  },
]);

export default router;
