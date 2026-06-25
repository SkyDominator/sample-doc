import defaultMdxComponents from "fumadocs-ui/mdx";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Cards,
} from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { DocsCodeBlock } from "@/components/mdx-code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function getMDXComponents(components = {}) {
  return {
    ...defaultMdxComponents,
    pre: DocsCodeBlock,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Cards,
    Callout,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    ...components,
  };
}

export const useMDXComponents = getMDXComponents;
