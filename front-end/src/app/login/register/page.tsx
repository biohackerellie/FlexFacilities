import CreateAccount from "./form";

export default function registrationPage() {
  "use no memo";
  return (
    <>
      <div className="max-h-100[dvh] fixed inset-0 m-auto flex h-[5rem] w-auto max-w-[100vw] items-center justify-center">
        <CreateAccount />
      </div>
    </>
  );
}
