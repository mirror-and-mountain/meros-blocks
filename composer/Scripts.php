<?php

namespace MM\Meros\Composer;

use MM\Meros\Helpers\PluginInfo;

class Scripts
{
    public static function afterPluginInstall( $event ): void
    {
        $composer = $event->getComposer();
        $installationManager = $composer->getInstallationManager();

        // Example if you want to loop installed packages:
        foreach ($composer->getRepositoryManager()->getLocalRepository()->getPackages() as $package) {
            $packageName = $package->getName();
            $packageType = $package->getType();
            $installPath = $installationManager->getInstallPath($package);

            if ($packageType === 'wordpress-plugin') {
                $io = $event->getIO();
                $io->write("Handling plugin package: {$packageName} at {$installPath}");

                $pluginInfo = PluginInfo::get( $installPath );

                if (!$pluginInfo) {
                    $io->write("<error>No main plugin file found in {$installPath}</error>");
                    continue;
                }

                $pluginFile = $pluginInfo['File'];
                
                $io->write("<info>Main plugin file detected: {$pluginFile}</info>");
                $io->write("Generating plugin feature class</info>");

                $featureClass = str_replace(' ', '', ucwords(str_replace('-', ' ', basename($installPath))));
                $featureFile  = dirname(__DIR__) . '/app/Features/' . $featureClass . '.php';
                $vendorPath   = dirname(__DIR__) . '/vendor';
                $stubPath     = $vendorPath . '/mirror-and-mountain/meros-framework/src/stubs/Feature.stub';

                if (file_exists( $stubPath ) && !file_exists( $featureFile )) {
                    $stub     = file_get_contents( $stubPath );
                    $rendered = str_replace('{{class}}', $featureClass, $stub);

                    file_put_contents($featureFile, $rendered);
                    $io->write("<info>Generated: {$featureFile}</info>");
                }
            }
        }
    }
}
