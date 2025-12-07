import MeusExamesLogo from '@/components/meus-exames-logo';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md ">
                <MeusExamesLogo className="size-full fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-lg">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Meus Exames
                </span>
            </div>
        </>
    );
}
