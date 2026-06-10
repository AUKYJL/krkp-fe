import { TaxiparkFormPage } from "../form";

type TaxiparkEditPageProps = {
  taxiparkId: string;
};

export const TaxiparkEditPage = ({
  taxiparkId,
}: TaxiparkEditPageProps) => {
  return <TaxiparkFormPage mode="edit" taxiparkId={taxiparkId} />;
};
