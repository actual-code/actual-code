import { convert } from "../convert";

const bootstrap = async () => {
  if (process.argv.length < 3) {
    console.log("usage actual-code <file.md>");
    process.exit(1);
  }
  const filename = process.argv[2];
  const converted = await convert(filename);
  process.stdout.write(converted);
  process.stdout.write("\n");
};

bootstrap();
