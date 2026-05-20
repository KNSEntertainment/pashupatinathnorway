
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, Link } from "@/i18n/navigation";
import {
    Menu,
    X,
    ChevronDown,
    Heart,
    LogOut,
    UserPlus,
    LogIn,
    User,
} from "lucide-react";

import { useTranslations } from "next-intl";
import { completeSignOut } from "@/utils/authUtils";
import Image from "next/image";
import clsx from "clsx";

type NavDropdownItem = {
    href: string;
    title: string;
};

type NavItem = {
    href: string;
    title: string;
    dropdown?: NavDropdownItem[];
};

type MobileMenuProps = {
    navItems: NavItem[];
};

export default function MobileMenu({
    navItems,
}: MobileMenuProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const t = useTranslations("navigation");

    const user = session?.user;

    const [isOpen, setIsOpen] =
        useState(false);

    const [expandedItem, setExpandedItem] =
        useState<string | null>(null);

    const closeMenu = () => {
        setIsOpen(false);
    };

    const normalizePath = (
        path: string
    ) => {
        return (
            path.replace(
                /^\/(en|no|ne)/,
                ""
            ) || "/"
        );
    };

    const currentPath =
        normalizePath(pathname);

    useEffect(() => {
        document.body.style.overflow =
            isOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow =
                "";
        };
    }, [isOpen]);

    useEffect(() => {
        const escapeHandler = (
            e: KeyboardEvent
        ) => {
            if (e.key === "Escape") {
                closeMenu();
            }
        };

        window.addEventListener(
            "keydown",
            escapeHandler
        );

        return () =>
            window.removeEventListener(
                "keydown",
                escapeHandler
            );
    }, []);

    const activeDropdown =
        useMemo(() => {
            return navItems.find(
                (item) =>
                    item.dropdown?.some(
                        (sub) =>
                            normalizePath(
                                sub.href
                            ) === currentPath
                    )
            );
        }, [
            currentPath,
            navItems,
        ]);

    useEffect(() => {
        if (activeDropdown) {
            setExpandedItem(
                activeDropdown.title
            );
        }
    }, [activeDropdown]);

    return (
        <>
            {/* Hamburger */}

            <button
                onClick={() =>
                    setIsOpen(
                        !isOpen
                    )
                }
                className="
                lg:hidden
                h-11
                w-11
                rounded-xl
                bg-white
                border
                border-gray-200
                shadow-sm
                flex
                items-center
                justify-center
                "
            >
                {isOpen ? (
                    <X size={18}/>
                ) : (
                    <Menu size={18}/>
                )}
            </button>

            {/* Overlay */}

            <div
                onClick={closeMenu}
                className={clsx(
                    `
                    fixed inset-0
                    z-40
                    bg-black/40
                    backdrop-blur-sm
                    transition-all
                    duration-300
                    lg:hidden
                    `,
                    isOpen
                        ? "opacity-100 visible"
                        : "opacity-0 invisible"
                )}
            />

            {/* Sidebar */}

            <aside
                onClick={(e) => e.stopPropagation()}
                className={clsx(
                    `
                    fixed
                    top-0
                    right-0
                    h-screen
                    w-[340px]
                    max-w-[90vw]
                    bg-white
                    shadow-2xl
                    z-50
                    flex
                    flex-col
                    transition-transform
                    duration-300
                    ease-out
                    lg:hidden
                    `,
                    isOpen
                        ? "translate-x-0"
                        : "translate-x-full"
                )}
            >
                {/* HEADER */}

                <div
                    className="
                    bg-brand_primary
                    px-6
                    py-5
                    border-b
                    border-black/5
                    "
                >
                    <div className="flex justify-between items-start">

                        <Image
                            src="/pashupatinath.png"
                            alt="Temple"
                            width={90}
                            height={90}
                        />

                        <button
                            onClick={
                                closeMenu
                            }
                            className="
                            p-2
                            rounded-lg
                            hover:bg-white/50
                            transition
                            "
                        >
                            <X size={20}/>
                        </button>
                    </div>

                    {/* Action buttons */}

                    <div className="grid grid-cols-2 gap-3 mt-5">

                        <Link
                            href="/donate"
                            onClick={
                                closeMenu
                            }
                            className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-gray-900
                            text-white
                            py-3
                            font-medium
                            hover:bg-black
                            transition
                            "
                        >
                            <Heart size={18}/>
                            {t("donate")}
                        </Link>
						     {!user && (
                            <Link
                                    href="/login"
                                    onClick={
                                        closeMenu
                                    }
                                    className="
                                    flex
                                    justify-center
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border-2
                                    border-gray-800
                                    py-3
                                    font-medium
                                    text-gray-900
                                    hover:bg-white/60
                                    transition
                                    "
                                >
                                    <LogIn size={18}/>
                                    {t("login")}
                                </Link>
                        )}

                        {!user && (

                            <div className="col-span-2">

                           

                                <Link
                                    href="/membership"
                                    onClick={
                                        closeMenu
                                    }
                                    className="
                                    flex
                                    justify-center
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-brand_secondary
                                    py-3
                                    font-medium
                                    text-gray-100
                                    hover:brightness-95
                                    transition
                                    "
                                >
                                    <UserPlus size={18}/>
                                    {t("become_member")}
                                </Link>

                            </div>
                        )}

                        {user && (
                            <button
                                onClick={() =>
                                    completeSignOut(
                                        "/",
                                        closeMenu
                                    )
                                }
                                className="
                                w-full
                                flex
                                justify-center
                                items-center
                                gap-2
                                rounded-xl
                                bg-red-600
                                text-white
                                py-3
                                font-medium
                                "
                            >
                                <LogOut size={18}/>
                                {t(
                                    "sign_out"
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* NAVIGATION */}

                <nav className="flex-1 overflow-y-auto px-4 py-5">

                    {navItems.map(
                        (item) => {

                            const hasDropdown =
                                item.dropdown
                                    ?.length;
                            
                            const isMainActive = currentPath === normalizePath(item.href);
                            
                            const isSubActive = hasDropdown && item.dropdown?.some(
                                (sub) => normalizePath(sub.href) === currentPath
                            );
                            
                            const active = isMainActive || isSubActive;

                            const expanded =
                                expandedItem ===
                                item.title;

                            return (
                                <div
                                    key={
                                        item.href
                                    }
                                    className="mb-2"
                                >
                                    {hasDropdown ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    setExpandedItem(
                                                        expanded
                                                            ? null
                                                            : item.title
                                                    )
                                                }
                                                className={clsx(
                                                    `
                                                    w-full
                                                    px-4 py-3
                                                    rounded-xl
                                                    flex
                                                    items-center
                                                    justify-between
                                                    transition
                                                    `,
                                                    active
                                                        ? `
                                                        bg-brand_secondary/15
                                                        text-gray-900
                                                        border-l-4
                                                        border-brand_secondary
                                                        `
                                                        : `
                                                        hover:bg-gray-100
                                                        `
                                                )}
                                            >
                                                {item.title}

                                                <ChevronDown
                                                    className={clsx(
                                                        `
                                                        transition-transform
                                                        duration-300
                                                        `,
                                                        expanded &&
                                                            "rotate-180"
                                                    )}
                                                />
                                            </button>

                                            <div
                                                className={clsx(
                                                    `
                                                    overflow-hidden
                                                    transition-all
                                                    duration-300
                                                    `,
                                                    expanded
                                                        ? "max-h-96"
                                                        : "max-h-0"
                                                )}
                                            >
                                                {item.dropdown?.map(
                                                    (
                                                        sub
                                                    ) => {
                                                        const isSubItemActive = normalizePath(sub.href) === currentPath;
                                                        
                                                        return (
                                                            <Link
                                                                key={
                                                                    sub.href
                                                                }
                                                                href={
                                                                    sub.href
                                                                }
                                                                onClick={
                                                                    closeMenu
                                                                }
                                                                className={clsx(
                                                                    `
                                                                    block
                                                                    ml-6
                                                                    mt-2
                                                                    px-4
                                                                    py-2
                                                                    rounded-lg
                                                                    text-sm
                                                                    transition
                                                                    `,
                                                                    isSubItemActive
                                                                        ? `
                                                                        bg-brand_secondary/10
                                                                        text-brand_secondary
                                                                        font-semibold
                                                                        border-l-3
                                                                        border-brand_secondary
                                                                        `
                                                                        : `
                                                                        text-gray-600
                                                                        hover:bg-gray-100
                                                                        hover:text-gray-800
                                                                        `
                                                                )}
                                                            >
                                                                {
                                                                    sub.title
                                                                }
                                                            </Link>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <Link
                                            href={
                                                item.href
                                            }
                                            onClick={
                                                closeMenu
                                            }
                                            className={clsx(
                                                `
                                                block
                                                px-4 py-3
                                                rounded-xl
                                                transition
                                                `,
                                                active
                                                    ? `
                                                    bg-brand_secondary/15
                                                    border-l-4
                                                    border-brand_secondary
                                                    text-gray-900
                                                    `
                                                    : `
                                                    hover:bg-gray-100
                                                    `
                                            )}
                                        >
                                            {
                                                item.title
                                            }
                                        </Link>
                                    )}
                                </div>
                            );
                        }
                    )}
                </nav>

                {/* FOOTER */}

                <div className="border-t p-5 pb-safe">

                    {user ? (
                        <div className="flex gap-3">

                            <div
                                className="
                                h-10
                                w-10
                                rounded-full
                                bg-brand_primary
                                flex
                                items-center
                                justify-center
                                "
                            >
                                <User
                                    size={
                                        18
                                    }
                                />
                            </div>

                            <div>
                                <p className="font-medium text-sm">
                                    {
                                        user.email
                                    }
                                </p>

                                <p className="text-xs text-gray-500">
                                    {user.role ===
                                    "admin"
                                        ? t("admin_account")
                                        : user.isMember
                                        ? user.membershipType
                                        : t("regular_user")}
                                </p>
                            </div>

                        </div>
                    ) : (
                        <p className="text-xs text-center text-gray-500">
                            {t("login_to_access_benefits")}
                        </p>
                    )}
                </div>

            </aside>
        </>
    );
}