import { PageHeader } from "../../_components/PageHeader";
import { ProductForm } from "../_components/ProductForm";

export default function NewProductPage() {
  return (
    <>
      <PageHeader>Create Product</PageHeader>
      <div className="mt-8">
        <ProductForm />
      </div>
    </>
  );
}
