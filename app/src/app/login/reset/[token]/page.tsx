import jwt from 'jsonwebtoken';

import ResetForm from './form';

function decodeToken(token: string) {
  const publicKey: string = Buffer.from(
    process.env.RSA_PUBLIC_KEY!,
    'base64',
  ).toString('utf-8');
  const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  if (!decoded) {
    throw new Error('Invalid token');
  }

  return decoded;
}

export default function ResetPage({ params }: { params: { token: string } }) {
  const data = decodeToken(params.token);

  if (!data) {
    return <div>Invalid token</div>;
  } else {
    // TODO: improve types
    // @ts-expect-error - expected error
    const { id: userID } = data;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
        <ResetForm id={userID} />
      </div>
    );
  }
}
