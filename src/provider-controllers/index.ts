import { $TSContext } from "amplify-cli-core";
import { printer } from "amplify-prompts";

export const printNextStepsSuccessMessage = () => {
  printer.blankLine();
  printer.success('Next steps:');
  printer.info('"amplify push" builds all of your local backend resources and provisions them in the cloud');
  printer.info(
    '"amplify publish" builds all of your local backend and front-end resources (if you added hosting category) and provisions them in the cloud',
  );
  printer.blankLine();
};