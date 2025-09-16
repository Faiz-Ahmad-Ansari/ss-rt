export const metadata = {
  title: 'SS-RT',
  description: 'SuperStrikers-RisingThunder Records',
  manifest: "/manifest.json",
  themeColor: "#000000",
  icons: {
    icon: "/strikersLogo.png", // one image used everywhere
    apple: "/strikersLogo.png", // iOS will also use this
  },
  };
  
  
  import './globals.css';
  import Header from '../components/Header';
  import Footer from '../components/Footer';
  
  
  export default function RootLayout({ children }) {
  return (
  <html lang="en">
  <body>
  <Header />
  <main>{children}</main>
  <Footer />
  </body>
  </html>
  );
  }