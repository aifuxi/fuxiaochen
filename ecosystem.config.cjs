module.exports = {
  apps: [
    {
      name: "fuxiaochen-nextjs",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm ZZ",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
    },
  ],
};
