import Header from '@/components/Header';

export default function ConfirmEmailPage() {
  return (
    <>
      <Header isLoggedIn={false} />
      <div className="w-full max-w-content min-h-full-screen mx-auto py-8 px-4 flex items-center justify-center flex-col relative">
        <div className="w-full sm:w-3/4 h-[calc(100vh-240px)] sm:h-[40vh] px-12 border border-primary flex items-center justify-center rounded-3xl flex-wrap flex-col">
          <p className="text-2xl mb-8 text-center">Please confirm your email</p>
          <p className="text-center">
            We have sent a confirmation link to your email address. Please check
            your inbox and click the link to activate your account.
          </p>
        </div>
      </div>
    </>
  );
}
