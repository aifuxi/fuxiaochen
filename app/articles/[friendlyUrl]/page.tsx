const ArticleDetailPage = ({ params }: { params: { friendlyUrl: string } }) => {
  return <div>{params.friendlyUrl}</div>;
};

export default ArticleDetailPage;
