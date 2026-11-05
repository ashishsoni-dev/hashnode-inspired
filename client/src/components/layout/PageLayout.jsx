import Navbar from "./Navbar";
import Footer from "../common/Footer";

function PageLayout({ children }) {
    return (
        <>
            <Navbar />

            <main>{children}</main>

            <Footer />
        </>
    );
}

export default PageLayout;