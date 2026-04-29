import SideBar from '@/components/SideBar';
import './globals.css'
import { Figtree } from 'next/font/google'
import UserProvider from '@/providers/UserProvider';
import ModalProvider from '@/providers/ModalProvider';
import ToasterProvider from '@/providers/ToasterProvider';
import getSongsByUserId from '@/actions/getSongsByUserId';
import Player from '@/components/Player';

const figtree = Figtree({ subsets: ['latin'] })

export const metadata = {
  title: 'SpotifyClone',
  description: 'Listen to Music',
}

export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userSongs = await getSongsByUserId();

  return (
    <html lang="en">
      <body className={ figtree.className }>
        <ToasterProvider />
        <UserProvider>
          <ModalProvider />
          <SideBar songs={userSongs}>
            { children }
          </SideBar>
          <Player />
        </UserProvider>
      </body>
    </html>
  )
}
