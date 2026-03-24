<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import {
  ClipboardList,
  DollarSign,
  SquareTerminal,
  Wrench,
  Sunset,
  MapPin,
} from "lucide-vue-next";
import NavMain from "@/components/NavMain.vue";
import NavProjects from "@/components/NavProjects.vue";
import NavUser from "@/components/NavUser.vue";
import TeamSwitcher from "@/components/TeamSwitcher.vue";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

const data = {
  // navMain: [
  //   {
  //     title: "Relatórios",
  //     url: "#",
  //     icon: SquareTerminal,
  //     isActive: true,
  //     items: [
  //       {
  //         title: "Obras",
  //         url: `/relatorios/obras`,
  //       },
  //       {
  //         title: "Rotas",
  //         url: `/relatorios/rotas`,
  //       },
  //     ],
  //   },
  // ],
  projects: [
    {
      name: "Eventos",
      url: "/eventos",
      icon: Sunset,
    },
    {
      name: "Locais",
      url: "/locais",
      icon: MapPin,
    },
    {
      name: "Setores",
      url: "/setores",
      icon: Wrench,
    },
    {
      name: "Ingressos",
      url: "/ingressos",
      icon: Wrench,
    },
  ],
  tecnico: [
    // {
    //   name: "Chamados",
    //   url: "/tecnico/chamados",
    //   icon: Sunset,
    // },
    // {
    //   name: "Rota",
    //   url: "/tecnico/rota",
    //   icon: DollarSign,
    // },
  ],
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" :items-tecnico="data.tecnico" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
