import talabatLogo from "./Assets/Logo/Talabat-Logo.png";
import talabatIcon from "./Assets/Logo/Talabat-Logo-Icon.png";
import noonLogo from "./Assets/Logo/Noon-Food-Logo.png";
import noonIcon from "./Assets/Logo/Noon-Food-Logo-Icon.png";
import keetaLogo from "./Assets/Logo/Keeta-Logo.png";
import keetaIcon from "./Assets/Logo/Keeta-Logo-Icon.png";
import smilesLogo from "./Assets/Logo/Smiles-Logo.png";
import smilesIcon from "./Assets/Logo/Smiles-Logo-Icon.png";
import deliverooLogo from "./Assets/Logo/Deliveroo-Logo.png";
import deliverooIcon from "./Assets/Logo/Deliveroo-Logo-Icon.png";
import appleStore from "./Assets/Logo/apple-store.png";
import googlePlay from "./Assets/Logo/google-play-store.png";

export const aggregators = [
  {
    id: "talabat",
    name: "Talabat",
    logo: talabatLogo,
    icon: talabatIcon,
    url: "https://www.talabat.com/uae/lets-zinger",
    offer: "20% OFF",
    description: "Order your favorites for delivery",
  },
  {
    id: "noonfood",
    name: "noonfood",
    logo: noonLogo,
    icon: noonIcon,
    url: "https://food.noon.com/uae-en/outlet/LTSZNGYUBM/",
    offer: "30% OFF",
    description: "Order your favorites for delivery",
  },
  {
    id: "deliveroo",
    name: "Deliveroo",
    logo: deliverooLogo,
    icon: deliverooIcon,
    url: "https://deliveroo.ae/en/menu/sharjah/al-nasserya/lets-zinger-cafeteria-al-nasseriya",
    offer: "30% OFF",
    description: "Order your favorites for delivery",
  },
  {
    id: "keeta",
    name: "Keeta",
    logo: keetaLogo,
    icon: keetaIcon,
    offer: "50% OFF",
    description: "Download the app to order your favorites",
    stores: [
      {
        id: "apple",
        name: "App Store",
        icon: appleStore,
        url: "https://apps.apple.com/us/app/keeta-food-delivery/id1662451643",
      },
      {
        id: "google",
        name: "Google Play",
        icon: googlePlay,
        url: "https://play.google.com/store/apps/details?id=com.sankuai.sailor.afooddelivery&hl=en",
      },
    ],
  },
  {
    id: "smiles",
    name: "Smiles",
    logo: smilesLogo,
    icon: smilesIcon,
    offer: "30% OFF",
    description: "Download the app to order your favorites",
    stores: [
      {
        id: "apple",
        name: "App Store",
        icon: appleStore,
        url: "https://apps.apple.com/ae/app/smiles-food-grocery-lifestyle/id1225034537",
      },
      {
        id: "google",
        name: "Google Play",
        icon: googlePlay,
        url: "https://play.google.com/store/apps/details?id=ae.etisalat.smiles&hl=en",
      },
    ],
  },
];

export const footerLinks = [
  { label: "Terms & Conditions", href: "#terms" },
  { label: "Privacy Policy", href: "#privacy" },
];
